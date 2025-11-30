package com.campstation.community.services

import com.campstation.community.config.S3Config
import software.amazon.awssdk.core.sync.RequestBody
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest
import software.amazon.awssdk.services.s3.model.PutObjectRequest
import java.awt.Image
import java.awt.image.BufferedImage
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.util.UUID
import javax.imageio.ImageIO
import javax.imageio.ImageWriteParam
import javax.imageio.stream.MemoryCacheImageOutputStream
import com.drew.imaging.ImageMetadataReader
import com.drew.metadata.Metadata
import com.drew.metadata.exif.ExifIFD0Directory

data class ImageUploadResult(
    val originalUrl: String,
    val thumbnailUrl: String
)

class S3ImageService(private val s3Client: S3Client = S3Config.createS3Client()) {
    
    private val bucketName = S3Config.bucketName
    private val publicEndpoint = S3Config.publicEndpoint

    companion object {
        const val THUMBNAIL_WIDTH = 400
        const val THUMBNAIL_HEIGHT = 300
        const val ORIGINAL_MAX_WIDTH = 1920  // Full HD 너비
        const val ORIGINAL_MAX_HEIGHT = 1080 // Full HD 높이
        const val JPEG_QUALITY = 0.85f       // JPEG 압축 품질 (0.0 ~ 1.0)
        const val WEBP_QUALITY = 0.80f       // WebP 압축 품질 (더 나은 압축률)
        const val ENABLE_WEBP_CONVERSION = true  // WebP 변환 활성화
        const val REMOVE_EXIF = true         // EXIF 메타데이터 제거
        const val MAX_FILE_SIZE = 10 * 1024 * 1024  // 10MB
        const val MIN_IMAGE_SIZE = 100       // 최소 이미지 크기 (100x100)
        
        private val ALLOWED_EXTENSIONS = setOf("jpg", "jpeg", "png", "gif", "webp")
    }

    /**
     * 이미지 업로드 - 썸네일과 원본을 모두 업로드합니다
     * @param imageBytes 원본 이미지 바이트 배열
     * @param originalFilename 원본 파일명
     * @param folder 저장할 폴더 (예: "blacklists")
     * @return ImageUploadResult (original URL, thumbnail URL)
     */
    fun uploadImageWithThumbnail(
        imageBytes: ByteArray,
        originalFilename: String,
        folder: String = "blacklists"
    ): ImageUploadResult {
        // 파일 크기 검증
        validateFileSize(imageBytes)
        
        val extension = getFileExtension(originalFilename)
        validateExtension(extension)
        
        // 이미지 파일 유효성 검증
        validateImageContent(imageBytes)
        
        val uniqueId = UUID.randomUUID().toString()
        
        // 1. 원본 최적화 및 업로드 (1920x1080 이내로 리사이즈)
        val optimizedOriginalBytes = optimizeOriginal(imageBytes, extension)
        val originalKey = "$folder/original/$uniqueId$extension"
        uploadToS3(originalKey, optimizedOriginalBytes, getContentType(extension))
        val originalUrl = "$publicEndpoint/$originalKey"
        
        // 2. 썸네일 생성 및 업로드 (400x300)
        val thumbnailBytes = createThumbnail(imageBytes, extension)
        val thumbnailKey = "$folder/thumbnail/$uniqueId$extension"
        uploadToS3(thumbnailKey, thumbnailBytes, getContentType(extension))
        val thumbnailUrl = "$publicEndpoint/$thumbnailKey"
        
        println("Uploaded image pair: original=$originalUrl, thumbnail=$thumbnailUrl")
        
        return ImageUploadResult(
            originalUrl = originalUrl,
            thumbnailUrl = thumbnailUrl
        )
    }

    /**
     * 원본 이미지 최적화 (1920x1080 이내로 리사이즈 + 품질 압축 + EXIF 제거 + WebP 변환)
     */
    private fun optimizeOriginal(imageBytes: ByteArray, extension: String): ByteArray {
        val inputStream = ByteArrayInputStream(imageBytes)
        val originalImage = ImageIO.read(inputStream)
            ?: throw IllegalArgumentException("Invalid image format")

        // 이미 최적 크기 이하면 압축만 수행
        if (originalImage.width <= ORIGINAL_MAX_WIDTH && originalImage.height <= ORIGINAL_MAX_HEIGHT) {
            return if (ENABLE_WEBP_CONVERSION) {
                convertToWebP(originalImage)
            } else {
                compressImage(originalImage, extension)
            }
        }

        // 비율 유지하며 리사이즈
        val (newWidth, newHeight) = calculateThumbnailSize(
            originalImage.width,
            originalImage.height,
            ORIGINAL_MAX_WIDTH,
            ORIGINAL_MAX_HEIGHT
        )

        val scaledImage = originalImage.getScaledInstance(newWidth, newHeight, Image.SCALE_SMOOTH)
        val optimized = BufferedImage(newWidth, newHeight, BufferedImage.TYPE_INT_RGB)
        
        val g2d = optimized.createGraphics()
        g2d.drawImage(scaledImage, 0, 0, null)
        g2d.dispose()

        return if (ENABLE_WEBP_CONVERSION) {
            convertToWebP(optimized)
        } else {
            compressImage(optimized, extension)
        }
    }

    /**
     * WebP 형식으로 변환 (더 나은 압축률)
     */
    private fun convertToWebP(image: BufferedImage): ByteArray {
        val outputStream = ByteArrayOutputStream()
        val writers = ImageIO.getImageWritersByFormatName("webp")
        
        if (writers.hasNext()) {
            val writer = writers.next()
            val writeParam = writer.defaultWriteParam
            
            if (writeParam.canWriteCompressed()) {
                writeParam.compressionMode = ImageWriteParam.MODE_EXPLICIT
                writeParam.compressionQuality = WEBP_QUALITY
            }
            
            writer.output = MemoryCacheImageOutputStream(outputStream)
            writer.write(null, javax.imageio.IIOImage(image, null, null), writeParam)
            writer.dispose()
            
            println("Converted image to WebP format with quality $WEBP_QUALITY")
        } else {
            // WebP writer가 없으면 JPEG으로 폴백
            println("WebP writer not available, falling back to JPEG")
            return compressImage(image, ".jpg")
        }
        
        return outputStream.toByteArray()
    }

    /**
     * 이미지 압축 (JPEG 품질 적용)
     */
    private fun compressImage(image: BufferedImage, extension: String): ByteArray {
        val outputStream = ByteArrayOutputStream()
        val format = when (extension.lowercase()) {
            ".jpg", ".jpeg" -> "jpg"
            ".png" -> "png"
            ".gif" -> "gif"
            ".webp" -> "webp"
            else -> "jpg"
        }

        // JPEG의 경우 품질 설정 및 Progressive 모드 적용
        if (format == "jpg") {
            val writers = ImageIO.getImageWritersByFormatName("jpg")
            if (writers.hasNext()) {
                val writer = writers.next()
                val writeParam = writer.defaultWriteParam
                writeParam.compressionMode = javax.imageio.ImageWriteParam.MODE_EXPLICIT
                writeParam.compressionQuality = JPEG_QUALITY
                
                // Progressive JPEG 활성화 (점진적 로딩)
                writeParam.progressiveMode = javax.imageio.ImageWriteParam.MODE_DEFAULT
                
                writer.output = javax.imageio.ImageIO.createImageOutputStream(outputStream)
                writer.write(null, javax.imageio.IIOImage(image, null, null), writeParam)
                writer.dispose()
                
                println("Applied progressive JPEG with quality $JPEG_QUALITY")
            } else {
                ImageIO.write(image, format, outputStream)
            }
        } else {
            ImageIO.write(image, format, outputStream)
        }
        
        return outputStream.toByteArray()
    }

    /**
     * 썸네일 생성
     */
    private fun createThumbnail(imageBytes: ByteArray, extension: String): ByteArray {
        val inputStream = ByteArrayInputStream(imageBytes)
        val originalImage = ImageIO.read(inputStream)
            ?: throw IllegalArgumentException("Invalid image format")

        // 비율 유지하며 리사이즈
        val (newWidth, newHeight) = calculateThumbnailSize(
            originalImage.width,
            originalImage.height,
            THUMBNAIL_WIDTH,
            THUMBNAIL_HEIGHT
        )

        val scaledImage = originalImage.getScaledInstance(newWidth, newHeight, Image.SCALE_SMOOTH)
        val thumbnail = BufferedImage(newWidth, newHeight, BufferedImage.TYPE_INT_RGB)
        
        val g2d = thumbnail.createGraphics()
        g2d.drawImage(scaledImage, 0, 0, null)
        g2d.dispose()

        // 바이트 배열로 변환
        val outputStream = ByteArrayOutputStream()
        val format = when (extension.lowercase()) {
            ".jpg", ".jpeg" -> "jpg"
            ".png" -> "png"
            ".gif" -> "gif"
            ".webp" -> "webp"
            else -> "jpg"
        }
        ImageIO.write(thumbnail, format, outputStream)
        
        return outputStream.toByteArray()
    }

    /**
     * 썸네일 크기 계산 (비율 유지)
     */
    private fun calculateThumbnailSize(
        originalWidth: Int,
        originalHeight: Int,
        maxWidth: Int,
        maxHeight: Int
    ): Pair<Int, Int> {
        val widthRatio = maxWidth.toDouble() / originalWidth
        val heightRatio = maxHeight.toDouble() / originalHeight
        val ratio = minOf(widthRatio, heightRatio)
        
        val newWidth = (originalWidth * ratio).toInt()
        val newHeight = (originalHeight * ratio).toInt()
        
        return Pair(newWidth, newHeight)
    }

    /**
     * S3에 파일 업로드
     */
    private fun uploadToS3(key: String, bytes: ByteArray, contentType: String) {
        val putRequest = PutObjectRequest.builder()
            .bucket(bucketName)
            .key(key)
            .contentType(contentType)
            .build()

        s3Client.putObject(putRequest, RequestBody.fromBytes(bytes))
    }

    /**
     * S3에서 파일 삭제
     */
    fun deleteFromS3(url: String) {
        val key = extractKeyFromUrl(url)
        val deleteRequest = DeleteObjectRequest.builder()
            .bucket(bucketName)
            .key(key)
            .build()
        
        s3Client.deleteObject(deleteRequest)
        println("Deleted from S3: $key")
    }

    /**
     * URL에서 S3 키 추출
     * 예: http://localhost:9000/campstation-dev/blacklists/original/uuid.jpg -> blacklists/original/uuid.jpg
     */
    private fun extractKeyFromUrl(url: String): String {
        return url.substringAfter("$bucketName/")
    }

    /**
     * 파일 확장자 추출
     */
    private fun getFileExtension(filename: String): String {
        val lastDot = filename.lastIndexOf('.')
        return if (lastDot != -1) {
            filename.substring(lastDot).lowercase()
        } else {
            ".jpg"
        }
    }

    /**
     * 확장자 검증
     */
    private fun validateExtension(extension: String) {
        val ext = extension.removePrefix(".")
        if (ext !in ALLOWED_EXTENSIONS) {
            throw IllegalArgumentException("Unsupported file extension: $extension. Allowed: $ALLOWED_EXTENSIONS")
        }
    }

    /**
     * Content-Type 반환
     */
    private fun getContentType(extension: String): String {
        // WebP 변환이 활성화된 경우 항상 WebP 반환
        if (ENABLE_WEBP_CONVERSION) {
            return "image/webp"
        }
        
        return when (extension.lowercase()) {
            ".jpg", ".jpeg" -> "image/jpeg"
            ".png" -> "image/png"
            ".gif" -> "image/gif"
            ".webp" -> "image/webp"
            else -> "application/octet-stream"
        }
    }

    /**
     * 파일 크기 검증
     */
    private fun validateFileSize(imageBytes: ByteArray) {
        if (imageBytes.size > MAX_FILE_SIZE) {
            throw IllegalArgumentException(
                "File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB. " +
                "Current size: ${imageBytes.size / 1024 / 1024}MB"
            )
        }
    }

    /**
     * 이미지 내용 검증
     */
    private fun validateImageContent(imageBytes: ByteArray) {
        try {
            val inputStream = ByteArrayInputStream(imageBytes)
            val image = ImageIO.read(inputStream)
                ?: throw IllegalArgumentException("Invalid image file: Cannot decode image")
            
            // 최소 크기 검증
            if (image.width < MIN_IMAGE_SIZE || image.height < MIN_IMAGE_SIZE) {
                throw IllegalArgumentException(
                    "Image dimensions too small. Minimum size: ${MIN_IMAGE_SIZE}x${MIN_IMAGE_SIZE}. " +
                    "Current size: ${image.width}x${image.height}"
                )
            }
            
            println("Image validation passed: ${image.width}x${image.height}")
        } catch (e: Exception) {
            throw IllegalArgumentException("Invalid image file: ${e.message}", e)
        }
    }

    /**
     * EXIF 메타데이터 제거 (프라이버시 보호)
     * Note: ImageIO.read()는 자동으로 대부분의 메타데이터를 제거하므로
     * 재인코딩만으로도 EXIF 제거 효과가 있습니다.
     */
    private fun removeExifMetadata(imageBytes: ByteArray): ByteArray {
        if (!REMOVE_EXIF) return imageBytes
        
        try {
            val inputStream = ByteArrayInputStream(imageBytes)
            val image = ImageIO.read(inputStream)
                ?: return imageBytes
            
            // 이미지 재인코딩 (메타데이터 제거)
            val outputStream = ByteArrayOutputStream()
            ImageIO.write(image, "jpg", outputStream)
            
            println("EXIF metadata removed from image")
            return outputStream.toByteArray()
        } catch (e: Exception) {
            println("Failed to remove EXIF metadata: ${e.message}")
            return imageBytes
        }
    }
}
