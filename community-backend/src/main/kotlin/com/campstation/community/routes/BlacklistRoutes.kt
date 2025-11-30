package com.campstation.community.routes

import com.campstation.community.models.*
import com.campstation.community.services.BlacklistService
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.blacklistRoutes(blacklistService: BlacklistService) {
    route("/api/blacklist") {
        
        // Get all blacklists with filtering
        get {
            try {
                val region = call.request.queryParameters["region"]
                val dangerLevel = call.request.queryParameters["dangerLevel"]
                val search = call.request.queryParameters["search"]
                val sortBy = call.request.queryParameters["sortBy"] ?: "latest"
                val page = call.request.queryParameters["page"]?.toIntOrNull() ?: 1
                val limit = call.request.queryParameters["limit"]?.toIntOrNull() ?: 20

                val filter = BlacklistFilterRequest(
                    region = region,
                    dangerLevel = dangerLevel,
                    search = search,
                    sortBy = sortBy,
                    page = page,
                    limit = limit
                )

                val response = blacklistService.getAllBlacklists(filter)
                call.respond(HttpStatusCode.OK, response)
            } catch (e: Exception) {
                call.respond(
                    HttpStatusCode.InternalServerError,
                    mapOf("error" to (e.message ?: "Unknown error"))
                )
            }
        }

        // Get blacklist stats
        get("/stats") {
            try {
                val stats = blacklistService.getStats()
                call.respond(HttpStatusCode.OK, stats)
            } catch (e: Exception) {
                call.respond(
                    HttpStatusCode.InternalServerError,
                    mapOf("error" to (e.message ?: "Unknown error"))
                )
            }
        }

        // Get blacklist by ID
        get("/{id}") {
            try {
                val id = call.parameters["id"] ?: return@get call.respond(
                    HttpStatusCode.BadRequest,
                    mapOf("error" to "Missing ID parameter")
                )

                val blacklist = blacklistService.getBlacklistById(id)
                if (blacklist != null) {
                    // Increment views
                    blacklistService.incrementViews(id)
                    call.respond(HttpStatusCode.OK, blacklist)
                } else {
                    call.respond(
                        HttpStatusCode.NotFound,
                        mapOf("error" to "Blacklist not found")
                    )
                }
            } catch (e: Exception) {
                call.respond(
                    HttpStatusCode.InternalServerError,
                    mapOf("error" to (e.message ?: "Unknown error"))
                )
            }
        }

        // Create new blacklist
        post {
            try {
                val request = call.receive<BlacklistCreateRequest>()

                // Validation
                if (request.name.isBlank()) {
                    return@post call.respond(
                        HttpStatusCode.BadRequest,
                        mapOf("error" to "이름을 입력해주세요")
                    )
                }

                if (request.age < 19) {
                    return@post call.respond(
                        HttpStatusCode.BadRequest,
                        mapOf("error" to "만 19세 이상만 등록 가능합니다")
                    )
                }

                if (request.phone.isBlank()) {
                    return@post call.respond(
                        HttpStatusCode.BadRequest,
                        mapOf("error" to "연락처를 입력해주세요")
                    )
                }

                if (request.region.isBlank()) {
                    return@post call.respond(
                        HttpStatusCode.BadRequest,
                        mapOf("error" to "지역을 선택해주세요")
                    )
                }

                if (request.pcCafe.isBlank()) {
                    return@post call.respond(
                        HttpStatusCode.BadRequest,
                        mapOf("error" to "PC방 이름을 입력해주세요")
                    )
                }

                if (request.reason.isBlank()) {
                    return@post call.respond(
                        HttpStatusCode.BadRequest,
                        mapOf("error" to "사유를 입력해주세요")
                    )
                }

                if (request.description.length < 20) {
                    return@post call.respond(
                        HttpStatusCode.BadRequest,
                        mapOf("error" to "상세 내용을 최소 20자 이상 입력해주세요")
                    )
                }

                val blacklist = blacklistService.createBlacklist(request)
                call.respond(HttpStatusCode.Created, blacklist)
            } catch (e: Exception) {
                e.printStackTrace()
                call.respond(
                    HttpStatusCode.InternalServerError,
                    mapOf("error" to (e.message ?: "Unknown error"))
                )
            }
        }
    }
}
