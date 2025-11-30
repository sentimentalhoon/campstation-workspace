package com.campstation.community.routes

import com.campstation.community.services.SportsApiService
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.sportsRoutes(sportsService: SportsApiService) {
    route("/api/sports") {
        get("/live") {
            val matches = sportsService.getLiveMatches()
            call.respond(matches)
        }
        
        get("/upcoming") {
            val matches = sportsService.getUpcomingMatches()
            call.respond(matches)
        }
    }
}
