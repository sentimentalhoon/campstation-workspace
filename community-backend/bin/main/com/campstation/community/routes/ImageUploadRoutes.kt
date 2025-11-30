package com.campstation.community.routes

import com.campstation.community.services.S3ImageService
import io.ktor.http.*
import io.ktor.http.content.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.imageUploadRoutes(imageService: S3ImageService) {
    route("/api/upload") {
        
        // Upload image with thumbnail generation
        post("/image") {
            try {
                val multipart = call.receiveMultipart()
                var imageBytes: ByteArray? = null
                var originalFilename: String? = null
                var folder = "blacklists" // 기본값

                multipart.forEachPart { part ->
                    when (part) {
                        is PartData.FileItem -> {
                            originalFilename = part.originalFileName ?: "image.jpg"
                            imageBytes = part.streamProvider().readBytes()
                        }
                        is PartData.FormItem -> {
                            if (part.name == "folder") {
                                folder = part.value
                            }
                        }
                        else -> {}
                    }
                    part.dispose()
                }

                if (imageBytes == null || originalFilename == null) {
                    return@post call.respond(
                        HttpStatusCode.BadRequest,
                        mapOf("error" to "No image file provided")
                    )
                }

                // Upload image with thumbnail
                val result = imageService.uploadImageWithThumbnail(
                    imageBytes = imageBytes!!,
                    originalFilename = originalFilename!!,
                    folder = folder
                )

                call.respond(HttpStatusCode.OK, mapOf(
                    "success" to true,
                    "originalUrl" to result.originalUrl,
                    "thumbnailUrl" to result.thumbnailUrl
                ))

            } catch (e: IllegalArgumentException) {
                call.respond(
                    HttpStatusCode.BadRequest,
                    mapOf("error" to (e.message ?: "Invalid image format"))
                )
            } catch (e: Exception) {
                e.printStackTrace()
                call.respond(
                    HttpStatusCode.InternalServerError,
                    mapOf("error" to "Image upload failed: ${e.message}")
                )
            }
        }

        // Delete image (both thumbnail and original)
        delete("/image") {
            try {
                val params = call.receiveParameters()
                val originalUrl = params["originalUrl"]
                val thumbnailUrl = params["thumbnailUrl"]

                if (originalUrl.isNullOrBlank() && thumbnailUrl.isNullOrBlank()) {
                    return@delete call.respond(
                        HttpStatusCode.BadRequest,
                        mapOf("error" to "No image URLs provided")
                    )
                }

                if (!originalUrl.isNullOrBlank()) {
                    imageService.deleteFromS3(originalUrl)
                }
                if (!thumbnailUrl.isNullOrBlank()) {
                    imageService.deleteFromS3(thumbnailUrl)
                }

                call.respond(HttpStatusCode.OK, mapOf(
                    "success" to true,
                    "message" to "Images deleted successfully"
                ))

            } catch (e: Exception) {
                e.printStackTrace()
                call.respond(
                    HttpStatusCode.InternalServerError,
                    mapOf("error" to "Image deletion failed: ${e.message}")
                )
            }
        }
    }
}
