package com.campstation.community.services

import com.campstation.community.models.*
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonPrimitive
import redis.clients.jedis.JedisPool
import java.time.LocalDate
import java.time.format.DateTimeFormatter

interface SportsApiService {
    suspend fun getLiveMatches(): List<Match>
    suspend fun getUpcomingMatches(): List<Match>
}

class RealSportsApiService(
    private val apiKey: String,
    private val redisHost: String,
    private val redisPort: Int
) : SportsApiService {

    companion object {
        private const val API_BASE_URL = "https://api-football-v1.p.rapidapi.com/v3"
        private const val API_HOST = "api-football-v1.p.rapidapi.com"
        private const val CACHE_TTL_LIVE = 60 // seconds
        private const val CACHE_TTL_UPCOMING = 600 // seconds
        
        private val json = Json {
            ignoreUnknownKeys = true
            isLenient = true
            prettyPrint = false
            coerceInputValues = true
        }
    }

    private val client = HttpClient(CIO) {
        install(ContentNegotiation) {
            json(json)
        }
        install(HttpTimeout) {
            requestTimeoutMillis = 15000
            connectTimeoutMillis = 10000
            socketTimeoutMillis = 15000
        }
        defaultRequest {
            header("x-rapidapi-host", API_HOST)
            header("x-rapidapi-key", apiKey)
        }
    }

    private val jedisPool = JedisPool(redisHost, redisPort)
    private val mockService = MockSportsApiService()

    override suspend fun getLiveMatches(): List<Match> = withContext(Dispatchers.IO) {
        val cacheKey = "sports:live"
        
        // 1. Try Redis Cache
        getCachedMatches(cacheKey)?.let { return@withContext it }

        // 2. Fetch from API
        println("Fetching live matches from API")
        try {
            val response = client.get("$API_BASE_URL/fixtures") {
                parameter("live", "all")
            }

            when (response.status) {
                HttpStatusCode.OK -> {
                    val responseText = response.bodyAsText()
                    println("Live Matches API Response received")
                    
                    parseApiResponse(responseText)?.let { matches ->
                        cacheMatches(cacheKey, matches, CACHE_TTL_LIVE)
                        return@withContext matches
                    } ?: run {
                        println("Failed to parse API response, falling back to mock data")
                        return@withContext mockService.getLiveMatches()
                    }
                }
                else -> {
                    val errorBody = response.bodyAsText()
                    println("API Error (${response.status}): $errorBody")
                    println("Note: If 'not subscribed', visit https://rapidapi.com/api-sports/api/api-football and click Subscribe")
                    println("Falling back to mock data for live matches")
                    return@withContext mockService.getLiveMatches()
                }
            }
        } catch (e: Exception) {
            println("Error fetching live matches: ${e.message}")
            e.printStackTrace()
            return@withContext mockService.getLiveMatches()
        }
    }

    override suspend fun getUpcomingMatches(): List<Match> = withContext(Dispatchers.IO) {
        val today = LocalDate.now().format(DateTimeFormatter.ISO_DATE)
        val tomorrow = LocalDate.now().plusDays(1).format(DateTimeFormatter.ISO_DATE)
        val cacheKey = "sports:upcoming:$today"

        // 1. Try Redis Cache
        getCachedMatches(cacheKey)?.let { return@withContext it }

        // 2. Fetch from API
        println("Fetching upcoming matches from API")
        try {
            val nextWeek = LocalDate.now().plusDays(7).format(DateTimeFormatter.ISO_DATE)
            val response = client.get("$API_BASE_URL/fixtures") {
                parameter("date", today)
                parameter("timezone", "UTC")
            }

            when (response.status) {
                HttpStatusCode.OK -> {
                    val responseText = response.bodyAsText()
                    println("Upcoming Matches API Response received")
                    
                    parseApiResponse(responseText)?.let { matches ->
                        cacheMatches(cacheKey, matches, CACHE_TTL_UPCOMING)
                        return@withContext matches
                    } ?: run {
                        println("Failed to parse API response, falling back to mock data")
                        return@withContext mockService.getUpcomingMatches()
                    }
                }
                else -> {
                    val errorBody = response.bodyAsText()
                    println("API Error (${response.status}): $errorBody")
                    println("Note: If 'not subscribed', visit https://rapidapi.com/api-sports/api/api-football and click Subscribe")
                    println("Falling back to mock data for upcoming matches")
                    return@withContext mockService.getUpcomingMatches()
                }
            }
        } catch (e: Exception) {
            println("Error fetching upcoming matches: ${e.message}")
            e.printStackTrace()
            return@withContext mockService.getUpcomingMatches()
        }
    }

    // Helper functions for Redis operations
    private suspend fun getCachedMatches(key: String): List<Match>? = withContext(Dispatchers.IO) {
        try {
            jedisPool.resource.use { jedis ->
                authenticateRedis(jedis)
                jedis.get(key)?.let { cached ->
                    println("Cache hit for key: $key")
                    json.decodeFromString<List<Match>>(cached)
                }
            }
        } catch (e: Exception) {
            println("Redis get error for key $key: ${e.message}")
            null
        }
    }

    private suspend fun cacheMatches(key: String, matches: List<Match>, ttl: Int) = withContext(Dispatchers.IO) {
        try {
            jedisPool.resource.use { jedis ->
                authenticateRedis(jedis)
                jedis.setex(key, ttl.toLong(), json.encodeToString(matches))
                println("Cached ${matches.size} matches with key: $key (TTL: ${ttl}s)")
            }
        } catch (e: Exception) {
            println("Redis set error for key $key: ${e.message}")
        }
    }

    private fun authenticateRedis(jedis: redis.clients.jedis.Jedis) {
        System.getenv("REDIS_PASSWORD")?.takeIf { it.isNotBlank() }?.let { password ->
            jedis.auth(password)
        }
    }

    private fun parseApiResponse(responseText: String): List<Match>? {
        return try {
            val jsonElement = json.parseToJsonElement(responseText)
            
            // Check for API error messages
            if (jsonElement is JsonObject && jsonElement.containsKey("message")) {
                val message = jsonElement["message"]?.jsonPrimitive?.content
                println("API Error: $message")
                return null
            }

            val response = json.decodeFromString<ApiFootballResponse>(responseText)
            response.response.map { it.toMatch() }
        } catch (e: Exception) {
            println("Error parsing API response: ${e.message}")
            e.printStackTrace()
            null
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
            ),
            Match(
                id = "live_3",
                league = "Premier League",
                homeTeam = "Manchester City",
                awayTeam = "Chelsea",
                startTime = "2024-11-30T19:00:00",
                status = "LIVE",
                homeScore = 2,
                awayScore = 1,
                odds = MatchOdds(1.85, 3.60, 4.20)
            ),
            Match(
                id = "live_4",
                league = "Serie A",
                homeTeam = "Inter Milan",
                awayTeam = "Napoli",
                startTime = "2024-11-30T20:45:00",
                status = "LIVE",
                homeScore = 1,
                awayScore = 0,
                odds = MatchOdds(2.20, 3.30, 3.40)
            ),
            Match(
                id = "live_5",
                league = "Bundesliga",
                homeTeam = "Bayern Munich",
                awayTeam = "Borussia Dortmund",
                startTime = "2024-11-30T18:30:00",
                status = "LIVE",
                homeScore = 3,
                awayScore = 2,
                odds = MatchOdds(1.75, 3.80, 4.50)
            ),
            Match(
                id = "live_6",
                league = "Ligue 1",
                homeTeam = "PSG",
                awayTeam = "Marseille",
                startTime = "2024-11-30T20:00:00",
                status = "LIVE",
                homeScore = 2,
                awayScore = 0,
                odds = MatchOdds(1.60, 4.00, 5.50)
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
            ),
            Match(
                id = "upcoming_2",
                league = "Premier League",
                homeTeam = "Manchester United",
                awayTeam = "Tottenham",
                startTime = "2024-12-01T06:30:00",
                status = "SCHEDULED",
                odds = MatchOdds(2.80, 3.20, 2.60)
            ),
            Match(
                id = "upcoming_3",
                league = "La Liga",
                homeTeam = "Atletico Madrid",
                awayTeam = "Sevilla",
                startTime = "2024-12-01T08:00:00",
                status = "SCHEDULED",
                odds = MatchOdds(1.95, 3.40, 3.90)
            ),
            Match(
                id = "upcoming_4",
                league = "Bundesliga",
                homeTeam = "RB Leipzig",
                awayTeam = "Bayer Leverkusen",
                startTime = "2024-12-01T10:30:00",
                status = "SCHEDULED",
                odds = MatchOdds(2.40, 3.30, 2.90)
            ),
            Match(
                id = "upcoming_5",
                league = "Ligue 1",
                homeTeam = "Lyon",
                awayTeam = "Monaco",
                startTime = "2024-12-01T12:00:00",
                status = "SCHEDULED",
                odds = MatchOdds(2.70, 3.10, 2.70)
            ),
            Match(
                id = "upcoming_6",
                league = "Premier League",
                homeTeam = "Newcastle",
                awayTeam = "Aston Villa",
                startTime = "2024-12-02T04:00:00",
                status = "SCHEDULED",
                odds = MatchOdds(2.20, 3.30, 3.30)
            ),
            Match(
                id = "upcoming_7",
                league = "Serie A",
                homeTeam = "AS Roma",
                awayTeam = "Lazio",
                startTime = "2024-12-02T06:45:00",
                status = "SCHEDULED",
                odds = MatchOdds(2.50, 3.20, 2.90)
            ),
            Match(
                id = "upcoming_8",
                league = "La Liga",
                homeTeam = "Valencia",
                awayTeam = "Real Sociedad",
                startTime = "2024-12-02T09:00:00",
                status = "SCHEDULED",
                odds = MatchOdds(2.60, 3.00, 2.80)
            )
        )
    }
}
