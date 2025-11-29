package com.campstation.community.services

import com.campstation.community.models.Match
import com.campstation.community.models.MatchOdds
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.json.Json
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import kotlin.random.Random

interface SportsApiService {
    suspend fun getLiveMatches(): List<Match>
    suspend fun getUpcomingMatches(): List<Match>
}

// 나중에 실제 API 키가 생기면 이 구현체를 교체하거나 수정해서 사용합니다.
class MockSportsApiService : SportsApiService {
    
    // 실제 HTTP Client 설정 (나중을 위해 남겨둠)
    private val client = HttpClient(CIO) {
        install(ContentNegotiation) {
            json(Json {
                ignoreUnknownKeys = true
                prettyPrint = true
            })
        }
    }

    override suspend fun getLiveMatches(): List<Match> {
        // 실제 API 호출 대신 더미 데이터 반환
        return listOf(
            Match(
                id = "live_1",
                league = "Premier League",
                homeTeam = "Arsenal",
                awayTeam = "Liverpool",
                startTime = LocalDateTime.now().minusMinutes(45).format(DateTimeFormatter.ISO_DATE_TIME),
                status = "LIVE",
                homeScore = 1,
                awayScore = 1,
                odds = MatchOdds(2.10, 3.50, 3.20)
            ),
            Match(
                id = "live_2",
                league = "La Liga",
                homeTeam = "Real Madrid",
                awayTeam = "Barcelona",
                startTime = LocalDateTime.now().minusMinutes(20).format(DateTimeFormatter.ISO_DATE_TIME),
                status = "LIVE",
                homeScore = 0,
                awayScore = 0,
                odds = MatchOdds(2.50, 3.40, 2.80)
            )
        )
    }

    override suspend fun getUpcomingMatches(): List<Match> {
        return listOf(
            Match(
                id = "upcoming_1",
                league = "Serie A",
                homeTeam = "Juventus",
                awayTeam = "AC Milan",
                startTime = LocalDateTime.now().plusHours(2).format(DateTimeFormatter.ISO_DATE_TIME),
                status = "SCHEDULED",
                odds = MatchOdds(2.30, 3.10, 3.00)
            ),
            Match(
                id = "upcoming_2",
                league = "Bundesliga",
                homeTeam = "Bayern Munich",
                awayTeam = "Dortmund",
                startTime = LocalDateTime.now().plusHours(5).format(DateTimeFormatter.ISO_DATE_TIME),
                status = "SCHEDULED",
                odds = MatchOdds(1.80, 4.00, 4.50)
            ),
            Match(
                id = "upcoming_3",
                league = "K-League",
                homeTeam = "FC Seoul",
                awayTeam = "Suwon Samsung",
                startTime = LocalDateTime.now().plusDays(1).format(DateTimeFormatter.ISO_DATE_TIME),
                status = "SCHEDULED",
                odds = MatchOdds(2.00, 3.30, 3.50)
            )
        )
    }
}
