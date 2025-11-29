package com.campstation.community.services

import com.campstation.community.models.*
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import redis.clients.jedis.JedisPool
import java.time.LocalDate
import java.time.format.DateTimeFormatter

import io.ktor.client.statement.*

interface SportsApiService {
    suspend fun getLiveMatches(): List<Match>
    suspend fun getUpcomingMatches(): List<Match>
}

class RealSportsApiService(
    private val apiKey: String,
    private val redisHost: String,
    private val redisPort: Int
) : SportsApiService {

    private val client = HttpClient(CIO) {
        install(ContentNegotiation) {
            json(Json {
                ignoreUnknownKeys = true
                prettyPrint = true
                isLenient = true
            })
        }
    }

    // Redis Connection Pool
    private val jedisPool = JedisPool(redisHost, redisPort)
    private val json = Json { ignoreUnknownKeys = true; isLenient = true }

import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonPrimitive

// ...

    override suspend fun getLiveMatches(): List<Match> {
        val cacheKey = "sports:live"
        
        // 1. Try Redis Cache
        try {
            jedisPool.resource.use { jedis ->
                // Redis 비밀번호 설정이 필요한 경우 auth 호출
                val redisPassword = System.getenv("REDIS_PASSWORD")
                if (!redisPassword.isNullOrEmpty()) {
                    jedis.auth(redisPassword)
                }
                
                val cached = jedis.get(cacheKey)
                if (cached != null) {
                    println("Returning cached live matches")
                    return json.decodeFromString<List<Match>>(cached)
                }
            }
        } catch (e: Exception) {
            println("Redis error: ${e.message}")
        }

        // 2. Fetch from API
        println("Fetching live matches from API")
        try {
            val responseText = client.get("https://api-football-v1.p.rapidapi.com/v3/fixtures") {
                parameter("live", "all")
                header("x-rapidapi-host", "api-football-v1.p.rapidapi.com")
                header("x-rapidapi-key", apiKey)
            }.bodyAsText()

            println("Live Matches API Response: $responseText")

            // Error Handling for API Response
            val jsonElement = json.parseToJsonElement(responseText)
            if (jsonElement is JsonObject && jsonElement.containsKey("message")) {
                val message = jsonElement["message"]?.jsonPrimitive?.content
                println("API Error: $message")
                // API 키 오류 등의 경우 빈 리스트 반환 (크래시 방지)
                return emptyList()
            }

            val response = json.decodeFromString<ApiFootballResponse>(responseText)
            val matches = response.response.map { it.toMatch() }

            // 3. Save to Redis (TTL: 60 seconds)
            try {
                jedisPool.resource.use { jedis ->
                    val redisPassword = System.getenv("REDIS_PASSWORD")
                    if (!redisPassword.isNullOrEmpty()) {
                        jedis.auth(redisPassword)
                    }
                    jedis.setex(cacheKey, 60, json.encodeToString(matches))
                }
            } catch (e: Exception) {
                println("Redis save error: ${e.message}")
            }

            return matches
        } catch (e: Exception) {
            e.printStackTrace()
            return emptyList()
        }
    }

    override suspend fun getUpcomingMatches(): List<Match> {
        val today = LocalDate.now().format(DateTimeFormatter.ISO_DATE)
        val cacheKey = "sports:upcoming:$today"

        // 1. Try Redis Cache
        try {
            jedisPool.resource.use { jedis ->
                val redisPassword = System.getenv("REDIS_PASSWORD")
                if (!redisPassword.isNullOrEmpty()) {
                    jedis.auth(redisPassword)
                }
                
                val cached = jedis.get(cacheKey)
                if (cached != null) {
                    println("Returning cached upcoming matches")
                    return json.decodeFromString<List<Match>>(cached)
                }
            }
        } catch (e: Exception) {
            println("Redis error: ${e.message}")
        }

        // 2. Fetch from API (Next 10 matches as an example)
        println("Fetching upcoming matches from API")
        try {
            val responseText = client.get("https://api-football-v1.p.rapidapi.com/v3/fixtures") {
                parameter("next", "20") // 가져올 경기 수
                header("x-rapidapi-host", "api-football-v1.p.rapidapi.com")
                header("x-rapidapi-key", apiKey)
            }.bodyAsText()

            println("Upcoming Matches API Response: $responseText")

            // Error Handling for API Response
            val jsonElement = json.parseToJsonElement(responseText)
            if (jsonElement is JsonObject && jsonElement.containsKey("message")) {
                val message = jsonElement["message"]?.jsonPrimitive?.content
                println("API Error: $message")
                return emptyList()
            }

            val response = json.decodeFromString<ApiFootballResponse>(responseText)
            val matches = response.response.map { it.toMatch() }

            // 3. Save to Redis (TTL: 10 minutes)
            try {
                jedisPool.resource.use { jedis ->
                    val redisPassword = System.getenv("REDIS_PASSWORD")
                    if (!redisPassword.isNullOrEmpty()) {
                        jedis.auth(redisPassword)
                    }
                    jedis.setex(cacheKey, 600, json.encodeToString(matches))
                }
            } catch (e: Exception) {
                println("Redis save error: ${e.message}")
            }

            return matches
        } catch (e: Exception) {
            e.printStackTrace()
            return emptyList()
        }
    }

    // Helper to convert API model to our Domain model
    private fun ApiFixture.toMatch(): Match {
        val statusShort = this.fixture.status.short
        val mappedStatus = when (statusShort) {
            "1H", "2H", "HT", "ET", "P", "LIVE" -> "LIVE"
            "FT", "AET", "PEN" -> "FINISHED"
            "NS", "TBD" -> "SCHEDULED"
            else -> "SCHEDULED"
        }

        // Mock Odds (API Free tier doesn't always provide odds in the same call, simplifying for now)
        // 실제로는 /odds 엔드포인트를 별도로 호출하거나 유료 플랜을 써야 함.
        // 여기서는 랜덤으로 생성하여 보여줌.
        val mockOdds = if (mappedStatus == "SCHEDULED") {
            MatchOdds(
                homeWin = (1.5 + Math.random() * 2.0),
                draw = (2.5 + Math.random() * 1.5),
                awayWin = (1.5 + Math.random() * 3.0)
            )
        } else null

        return Match(
            id = this.fixture.id.toString(),
            league = this.league.name,
            homeTeam = this.teams.home.name,
            awayTeam = this.teams.away.name,
            startTime = this.fixture.date,
            status = mappedStatus,
            homeScore = this.goals.home ?: 0,
            awayScore = this.goals.away ?: 0,
            odds = mockOdds
        )
    }
}

// Mock Service (Backup)
class MockSportsApiService : SportsApiService {
    // ...existing code...
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
        // ...existing code...
        // 실제 API 호출 대신 더미 데이터 반환
        return listOf(
            Match(
                id = "live_1",
                league = "Premier League",
                homeTeam = "Arsenal",
                awayTeam = "Liverpool",
                startTime = "2024-11-30T21:30:00",
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
                startTime = "2024-11-30T22:00:00",
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
                startTime = "2024-12-01T04:00:00",
                status = "SCHEDULED",
                odds = MatchOdds(2.30, 3.10, 3.00)
            )
        )
    }
}
