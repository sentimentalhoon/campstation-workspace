package com.campstation.community

import com.campstation.community.routes.sportsRoutes
import com.campstation.community.services.MockSportsApiService
import com.campstation.community.services.RealSportsApiService
import com.campstation.community.services.SportsApiService
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.json.Json

fun main() {
    embeddedServer(Netty, port = 8081, host = "0.0.0.0", module = Application::module)
        .start(wait = true)
}

fun Application.module() {
    // 1. Serialization (JSON)
    install(ContentNegotiation) {
        json(Json {
            prettyPrint = true
            isLenient = true
        })
    }

    // 2. CORS (Cross-Origin Resource Sharing)
    install(CORS) {
        allowMethod(HttpMethod.Options)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Delete)
        allowMethod(HttpMethod.Patch)
        allowHeader(HttpHeaders.Authorization)
        allowHeader(HttpHeaders.ContentType)
        allowHeader(HttpHeaders.AccessControlAllowOrigin)
        
        // 개발 환경 및 프로덕션 도메인 허용
        allowHost("localhost:3000")
        allowHost("localhost:3001")
        allowHost("mycamp.duckdns.org", schemes = listOf("http", "https"))
        anyHost() // 테스트용 (보안상 나중에 제한 필요)
    }

    // 3. Services
    // API Key는 환경변수에서 가져오거나 하드코딩 (보안상 환경변수 권장)
    // 빈 문자열("")로 넘어오는 경우를 대비해 takeIf { it.isNotBlank() } 추가
    val rapidApiKey = System.getenv("RAPID_API_KEY")?.takeIf { it.isNotBlank() } 
        ?: "c2f10b511emshde4ac22de2dc144p15df88jsnd27c9691ecc9"
    val redisHost = System.getenv("REDIS_HOST")?.takeIf { it.isNotBlank() } ?: "redis"
    val redisPort = System.getenv("REDIS_PORT")?.toIntOrNull() ?: 6379

    val sportsService: SportsApiService = try {
        RealSportsApiService(rapidApiKey, redisHost, redisPort)
    } catch (e: Exception) {
        println("Failed to initialize RealSportsApiService, falling back to Mock: ${e.message}")
        MockSportsApiService()
    }

    // 4. Routing
    routing {
        get("/") {
            call.respondText("Hello from CampStation Community Backend (Ktor)!")
        }
        get("/api/health") {
            call.respondText("OK")
        }
        
        // Sports Routes
        sportsRoutes(sportsService)
    }
}
