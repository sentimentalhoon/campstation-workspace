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
        private const val API_BASE_URL = "https://v3.football.api-sports.io"
        private const val CACHE_TTL_LIVE = 60 // seconds
        private const val CACHE_TTL_UPCOMING = 600 // seconds
        
        private val json = Json {
            ignoreUnknownKeys = true
            isLenient = true
            prettyPrint = false
            coerceInputValues = true
        }

        // Team name translations (English to Korean)
        private val teamNameKorean = mapOf(
            // K League 1
            "Ulsan" to "울산 HD",
            "Ulsan HD" to "울산 HD",
            "Pohang Steelers" to "포항 스틸러스",
            "Jeonbuk Motors" to "전북 현대",
            "Jeonbuk Hyundai Motors" to "전북 현대",
            "Gwangju FC" to "광주 FC",
            "Daegu FC" to "대구 FC",
            "Suwon FC" to "수원 FC",
            "Jeju United" to "제주 유나이티드",
            "FC Seoul" to "FC 서울",
            "Gangwon FC" to "강원 FC",
            "Incheon United" to "인천 유나이티드",
            "Daejeon Hana Citizen" to "대전 하나 시티즌",
            "Suwon Bluewings" to "수원 삼성",
            "Suwon Samsung Bluewings" to "수원 삼성",
            
            // K League 2
            "Busan I'Park" to "부산 아이파크",
            "Bucheon FC" to "부천 FC",
            "Gimpo FC" to "김포 FC",
            "Seoul E-Land" to "서울 이랜드",
            "Chungnam Asan" to "충남 아산",
            "Ansan Greeners" to "안산 그리너스",
            "Gyeongnam FC" to "경남 FC",
            "Jeonnam Dragons" to "전남 드래곤즈",
            "Cheonan City" to "천안 시티",
            "Seongnam FC" to "성남 FC",
            "Asan Mugunghwa" to "아산 무궁화",
            
            // Premier League
            "Arsenal" to "아스널",
            "Liverpool" to "리버풀",
            "Manchester City" to "맨체스터 시티",
            "Manchester United" to "맨체스터 유나이티드",
            "Chelsea" to "첼시",
            "Tottenham" to "토트넘",
            "Newcastle" to "뉴캐슬",
            "Aston Villa" to "애스턴 빌라",
            "West Ham" to "웨스트햄",
            "Brighton" to "브라이턴",
            "Fulham" to "풀럼",
            "Brentford" to "브렌트포드",
            "Crystal Palace" to "크리스탈 팰리스",
            "Wolves" to "울버햄튼",
            "Everton" to "에버튼",
            "Nottingham Forest" to "노팅엄 포레스트",
            "Leicester" to "레스터",
            "Leeds" to "리즈",
            "Southampton" to "사우샘프턴",
            "Bournemouth" to "본머스",
            
            // La Liga
            "Real Madrid" to "레알 마드리드",
            "Barcelona" to "바르셀로나",
            "Atletico Madrid" to "아틀레티코 마드리드",
            "Sevilla" to "세비야",
            "Valencia" to "발렌시아",
            "Real Sociedad" to "레알 소시에다드",
            "Athletic Club" to "아틀레틱 빌바오",
            "Villarreal" to "비야레알",
            "Real Betis" to "레알 베티스",
            "Celta Vigo" to "셀타 비고",
            "Osasuna" to "오사수나",
            "Girona" to "지로나",
            "Mallorca" to "마요르카",
            "Getafe" to "헤타페",
            "Rayo Vallecano" to "라요 바예카노",
            
            // Serie A
            "Juventus" to "유벤투스",
            "AC Milan" to "AC 밀란",
            "Inter Milan" to "인테르 밀란",
            "Napoli" to "나폴리",
            "AS Roma" to "AS 로마",
            "Lazio" to "라치오",
            "Atalanta" to "아탈란타",
            "Fiorentina" to "피오렌티나",
            "Torino" to "토리노",
            "Bologna" to "볼로냐",
            "Udinese" to "우디네세",
            "Sassuolo" to "사수올로",
            "Monza" to "몬자",
            "Lecce" to "레체",
            
            // Bundesliga
            "Bayern Munich" to "바이에른 뮌헨",
            "Borussia Dortmund" to "보루시아 도르트문트",
            "RB Leipzig" to "RB 라이프치히",
            "Bayer Leverkusen" to "바이어 레버쿠젠",
            "Union Berlin" to "우니온 베를린",
            "Freiburg" to "프라이부르크",
            "Eintracht Frankfurt" to "프랑크푸르트",
            "Wolfsburg" to "볼프스부르크",
            "Borussia Monchengladbach" to "보루시아 묀헨글라트바흐",
            "Mainz" to "마인츠",
            "Hoffenheim" to "호펜하임",
            "Cologne" to "쾰른",
            "Augsburg" to "아우크스부르크",
            "Stuttgart" to "슈투트가르트",
            "Hertha Berlin" to "헤르타 베를린",
            
            // Ligue 1
            "PSG" to "파리 생제르맹",
            "Paris Saint Germain" to "파리 생제르맹",
            "Marseille" to "마르세유",
            "Lyon" to "리옹",
            "Monaco" to "모나코",
            "Lille" to "릴",
            "Rennes" to "렌",
            "Nice" to "니스",
            "Lens" to "랑스",
            "Strasbourg" to "스트라스부르",
            "Nantes" to "낭트",
            "Montpellier" to "몽펠리에",
            "Reims" to "랭스",
            "Brest" to "브레스트",
            "Toulouse" to "툴루즈"
        )

        // League name translations
        private val leagueNameKorean = mapOf(
            "K League 1" to "K리그1",
            "K League 2" to "K리그2",
            "Premier League" to "프리미어 리그",
            "La Liga" to "라리가",
            "Serie A" to "세리에 A",
            "Bundesliga" to "분데스리가",
            "Ligue 1" to "리그 1",
            "UEFA Champions League" to "UEFA 챔피언스 리그",
            "UEFA Europa League" to "UEFA 유로파 리그",
            "FA Cup" to "FA컵",
            "Copa del Rey" to "코파 델 레이",
            "DFB Pokal" to "DFB 포칼",
            "Coppa Italia" to "코파 이탈리아",
            "Coupe de France" to "쿠프 드 프랑스"
        )

        fun translateTeamName(name: String): String = teamNameKorean[name] ?: name
        fun translateLeagueName(name: String): String = leagueNameKorean[name] ?: name
        
        // Major leagues filter
        private val majorLeagues = setOf(
            "Premier League",
            "La Liga",
            "Serie A",
            "Bundesliga",
            "Ligue 1",
            "K League 1",
            "K League 2"
        )
        
        fun isMajorLeague(leagueName: String): Boolean = majorLeagues.contains(leagueName)
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
            header("x-apisports-key", apiKey)
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
                        val filteredMatches = matches.filter { isMajorLeague(it.league) }
                        cacheMatches(cacheKey, filteredMatches, CACHE_TTL_LIVE)
                        return@withContext filteredMatches
                    } ?: run {
                        println("Failed to parse API response, falling back to mock data")
                        return@withContext mockService.getLiveMatches()
                    }
                }
                else -> {
                    val errorBody = response.bodyAsText()
                    println("API Error (${response.status}): $errorBody")
                    println("Note: Get your API key at https://dashboard.api-football.com/")
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
                        val filteredMatches = matches.filter { match ->
                            isMajorLeague(match.league) && match.odds != null
                        }
                        cacheMatches(cacheKey, filteredMatches, CACHE_TTL_UPCOMING)
                        return@withContext filteredMatches
                    } ?: run {
                        println("Failed to parse API response, falling back to mock data")
                        return@withContext mockService.getUpcomingMatches()
                    }
                }
                else -> {
                    val errorBody = response.bodyAsText()
                    println("API Error (${response.status}): $errorBody")
                    println("Note: Get your API key at https://dashboard.api-football.com/")
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
            league = translateLeagueName(this.league.name),
            homeTeam = translateTeamName(this.teams.home.name),
            awayTeam = translateTeamName(this.teams.away.name),
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
                league = "프리미어 리그",
                homeTeam = "아스널",
                awayTeam = "리버풀",
                startTime = "2024-11-30T21:30:00",
                status = "LIVE",
                homeScore = 1,
                awayScore = 1,
                odds = MatchOdds(2.10, 3.50, 3.20)
            ),
            Match(
                id = "live_2",
                league = "라리가",
                homeTeam = "레알 마드리드",
                awayTeam = "바르셀로나",
                startTime = "2024-11-30T22:00:00",
                status = "LIVE",
                homeScore = 0,
                awayScore = 0,
                odds = MatchOdds(2.50, 3.40, 2.80)
            ),
            Match(
                id = "live_3",
                league = "프리미어 리그",
                homeTeam = "맨체스터 시티",
                awayTeam = "첼시",
                startTime = "2024-11-30T19:00:00",
                status = "LIVE",
                homeScore = 2,
                awayScore = 1,
                odds = MatchOdds(1.85, 3.60, 4.20)
            ),
            Match(
                id = "live_4",
                league = "세리에 A",
                homeTeam = "인테르 밀란",
                awayTeam = "나폴리",
                startTime = "2024-11-30T20:45:00",
                status = "LIVE",
                homeScore = 1,
                awayScore = 0,
                odds = MatchOdds(2.20, 3.30, 3.40)
            ),
            Match(
                id = "live_5",
                league = "분데스리가",
                homeTeam = "바이에른 뮌헨",
                awayTeam = "보루시아 도르트문트",
                startTime = "2024-11-30T18:30:00",
                status = "LIVE",
                homeScore = 3,
                awayScore = 2,
                odds = MatchOdds(1.75, 3.80, 4.50)
            ),
            Match(
                id = "live_6",
                league = "리그 1",
                homeTeam = "파리 생제르맹",
                awayTeam = "마르세유",
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
                league = "세리에 A",
                homeTeam = "유벤투스",
                awayTeam = "AC 밀란",
                startTime = "2024-12-01T04:00:00",
                status = "SCHEDULED",
                odds = MatchOdds(2.30, 3.10, 3.00)
            ),
            Match(
                id = "upcoming_2",
                league = "프리미어 리그",
                homeTeam = "맨체스터 유나이티드",
                awayTeam = "토트넘",
                startTime = "2024-12-01T06:30:00",
                status = "SCHEDULED",
                odds = MatchOdds(2.80, 3.20, 2.60)
            ),
            Match(
                id = "upcoming_3",
                league = "라리가",
                homeTeam = "아틀레티코 마드리드",
                awayTeam = "세비야",
                startTime = "2024-12-01T08:00:00",
                status = "SCHEDULED",
                odds = MatchOdds(1.95, 3.40, 3.90)
            ),
            Match(
                id = "upcoming_4",
                league = "분데스리가",
                homeTeam = "RB 라이프치히",
                awayTeam = "바이어 레버쿠젠",
                startTime = "2024-12-01T10:30:00",
                status = "SCHEDULED",
                odds = MatchOdds(2.40, 3.30, 2.90)
            ),
            Match(
                id = "upcoming_5",
                league = "리그 1",
                homeTeam = "리옹",
                awayTeam = "모나코",
                startTime = "2024-12-01T12:00:00",
                status = "SCHEDULED",
                odds = MatchOdds(2.70, 3.10, 2.70)
            ),
            Match(
                id = "upcoming_6",
                league = "프리미어 리그",
                homeTeam = "뉴캐슬",
                awayTeam = "애스턴 빌라",
                startTime = "2024-12-02T04:00:00",
                status = "SCHEDULED",
                odds = MatchOdds(2.20, 3.30, 3.30)
            ),
            Match(
                id = "upcoming_7",
                league = "세리에 A",
                homeTeam = "AS 로마",
                awayTeam = "라치오",
                startTime = "2024-12-02T06:45:00",
                status = "SCHEDULED",
                odds = MatchOdds(2.50, 3.20, 2.90)
            ),
            Match(
                id = "upcoming_8",
                league = "라리가",
                homeTeam = "발렌시아",
                awayTeam = "레알 소시에다드",
                startTime = "2024-12-02T09:00:00",
                status = "SCHEDULED",
                odds = MatchOdds(2.60, 3.00, 2.80)
            )
        )
    }
}
