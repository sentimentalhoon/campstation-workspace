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
        val extension = getFileExtension(originalFilename)
        validateExtension(extension)
        
        val uniqueId = UUID.randomUUID().toString()
        
        // 1. 원본 업로드
        val originalKey = "$folder/original/$uniqueId$extension"
        uploadToS3(originalKey, imageBytes, getContentType(extension))
        val originalUrl = "$publicEndpoint/$originalKey"
        
        // 2. 썸네일 생성 및 업로드
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
        return when (extension.lowercase()) {
            ".jpg", ".jpeg" -> "image/jpeg"
            ".png" -> "image/png"
            ".gif" -> "image/gif"
            ".webp" -> "image/webp"
            else -> "application/octet-stream"
        }
    }
}
