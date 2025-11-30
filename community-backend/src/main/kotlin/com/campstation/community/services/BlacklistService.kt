package com.campstation.community.services

import com.campstation.community.models.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import redis.clients.jedis.JedisPool
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.UUID

interface BlacklistService {
    suspend fun getAllBlacklists(filter: BlacklistFilterRequest): BlacklistResponse
    suspend fun getBlacklistById(id: String): Blacklist?
    suspend fun createBlacklist(request: BlacklistCreateRequest): Blacklist
    suspend fun incrementViews(id: String): Boolean
    suspend fun getStats(): BlacklistStats
}

class RealBlacklistService(
    private val redisHost: String,
    private val redisPort: Int
) : BlacklistService {

    companion object {
        private const val BLACKLIST_KEY_PREFIX = "blacklist:"
        private const val BLACKLIST_LIST_KEY = "blacklists"
        private const val STATS_KEY = "blacklist:stats"
        
        private val json = Json {
            ignoreUnknownKeys = true
            isLenient = true
            prettyPrint = false
        }
    }

    private val jedisPool = JedisPool(redisHost, redisPort)

    override suspend fun getAllBlacklists(filter: BlacklistFilterRequest): BlacklistResponse = withContext(Dispatchers.IO) {
        try {
            jedisPool.resource.use { jedis ->
                authenticateRedis(jedis)
                
                // Get all blacklist IDs
                val blacklistIds = jedis.smembers(BLACKLIST_LIST_KEY)?.toList() ?: emptyList()
                
                // Fetch all blacklists
                var blacklists = blacklistIds.mapNotNull { id ->
                    jedis.get("$BLACKLIST_KEY_PREFIX$id")?.let { data ->
                        json.decodeFromString<Blacklist>(data)
                    }
                }

                // Apply filters
                filter.region?.takeIf { it != "전체" }?.let { region ->
                    blacklists = blacklists.filter { it.region == region }
                }

                filter.dangerLevel?.let { level ->
                    blacklists = blacklists.filter { it.dangerLevel == level }
                }

                filter.search?.takeIf { it.isNotBlank() }?.let { query ->
                    val lowerQuery = query.lowercase()
                    blacklists = blacklists.filter {
                        it.reason.lowercase().contains(lowerQuery) ||
                        it.description.lowercase().contains(lowerQuery) ||
                        it.pcCafe.lowercase().contains(lowerQuery)
                    }
                }

                // Apply sorting
                blacklists = when (filter.sortBy) {
                    "views" -> blacklists.sortedByDescending { it.views }
                    "danger" -> {
                        val dangerWeight = mapOf("위험" to 3, "경고" to 2, "주의" to 1)
                        blacklists.sortedByDescending { dangerWeight[it.dangerLevel] ?: 0 }
                    }
                    else -> blacklists.sortedByDescending { it.date }
                }

                // Pagination
                val total = blacklists.size
                val totalPages = (total + filter.limit - 1) / filter.limit
                val startIndex = (filter.page - 1) * filter.limit
                val endIndex = minOf(startIndex + filter.limit, total)
                
                val pagedBlacklists = if (startIndex < total) {
                    blacklists.subList(startIndex, endIndex)
                } else {
                    emptyList()
                }

                BlacklistResponse(
                    items = pagedBlacklists,
                    total = total,
                    page = filter.page,
                    totalPages = totalPages
                )
            }
        } catch (e: Exception) {
            println("Error fetching blacklists: ${e.message}")
            e.printStackTrace()
            // Return mock data as fallback
            val mockBlacklists = getMockBlacklists()
            BlacklistResponse(
                items = mockBlacklists,
                total = mockBlacklists.size,
                page = 1,
                totalPages = 1
            )
        }
    }

    override suspend fun getBlacklistById(id: String): Blacklist? = withContext(Dispatchers.IO) {
        try {
            jedisPool.resource.use { jedis ->
                authenticateRedis(jedis)
                jedis.get("$BLACKLIST_KEY_PREFIX$id")?.let { data ->
                    json.decodeFromString<Blacklist>(data)
                }
            }
        } catch (e: Exception) {
            println("Error fetching blacklist by ID: ${e.message}")
            null
        }
    }

    override suspend fun createBlacklist(request: BlacklistCreateRequest): Blacklist = withContext(Dispatchers.IO) {
        val id = UUID.randomUUID().toString()
        val now = LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME)
        
        val blacklist = Blacklist(
            id = id,
            name = maskName(request.name),
            age = request.age,
            gender = request.gender,
            phone = maskPhone(request.phone),
            region = request.region,
            pcCafe = request.pcCafe,
            dangerLevel = request.dangerLevel,
            reason = request.reason,
            description = request.description,
            detailedInfo = request.detailedInfo,
            date = now,
            views = 0,
            verified = false,
            images = emptyList(),
            reportedBy = request.reportedBy,
            reportDate = now,
            status = "검토 중"
        )

        try {
            jedisPool.resource.use { jedis ->
                authenticateRedis(jedis)
                
                // Save blacklist
                jedis.set("$BLACKLIST_KEY_PREFIX$id", json.encodeToString(blacklist))
                
                // Add to list
                jedis.sadd(BLACKLIST_LIST_KEY, id)
                
                // Update stats
                updateStats(jedis)
            }
        } catch (e: Exception) {
            println("Error creating blacklist: ${e.message}")
            e.printStackTrace()
        }

        blacklist
    }

    override suspend fun incrementViews(id: String): Boolean = withContext(Dispatchers.IO) {
        try {
            jedisPool.resource.use { jedis ->
                authenticateRedis(jedis)
                
                val data = jedis.get("$BLACKLIST_KEY_PREFIX$id") ?: return@withContext false
                val blacklist = json.decodeFromString<Blacklist>(data)
                val updated = blacklist.copy(views = blacklist.views + 1)
                
                jedis.set("$BLACKLIST_KEY_PREFIX$id", json.encodeToString(updated))
                true
            }
        } catch (e: Exception) {
            println("Error incrementing views: ${e.message}")
            false
        }
    }

    override suspend fun getStats(): BlacklistStats = withContext(Dispatchers.IO) {
        try {
            jedisPool.resource.use { jedis ->
                authenticateRedis(jedis)
                
                val blacklistIds = jedis.smembers(BLACKLIST_LIST_KEY)?.toList() ?: emptyList()
                val blacklists = blacklistIds.mapNotNull { id ->
                    jedis.get("$BLACKLIST_KEY_PREFIX$id")?.let { data ->
                        json.decodeFromString<Blacklist>(data)
                    }
                }

                BlacklistStats(
                    total = blacklists.size,
                    danger = blacklists.count { it.dangerLevel == "위험" },
                    warning = blacklists.count { it.dangerLevel == "경고" },
                    caution = blacklists.count { it.dangerLevel == "주의" }
                )
            }
        } catch (e: Exception) {
            println("Error fetching stats: ${e.message}")
            BlacklistStats(total = 0, danger = 0, warning = 0, caution = 0)
        }
    }

    private fun authenticateRedis(jedis: redis.clients.jedis.Jedis) {
        System.getenv("REDIS_PASSWORD")?.takeIf { it.isNotBlank() }?.let { password ->
            jedis.auth(password)
        }
    }

    private fun updateStats(jedis: redis.clients.jedis.Jedis) {
        // Stats are calculated on-demand, no need to cache
    }

    private fun maskName(name: String): String {
        if (name.length <= 1) return name
        return name.first() + "*".repeat(name.length - 1)
    }

    private fun maskPhone(phone: String): String {
        // Format: 010-1234-5678 -> 010-****-5678
        val parts = phone.split("-")
        return if (parts.size == 3) {
            "${parts[0]}-****-${parts[2]}"
        } else {
            phone.replace(Regex("\\d{4}(?=\\d{4})"), "****")
        }
    }

    private fun getMockBlacklists(): List<Blacklist> {
        val now = LocalDateTime.now()
        return listOf(
            Blacklist(
                id = "1",
                name = "김**",
                age = 23,
                gender = "남성",
                phone = "010-****-1234",
                region = "서울",
                pcCafe = "게임존 PC방",
                dangerLevel = "위험",
                reason = "기물 파손",
                description = "키보드와 마우스를 집어던지고 모니터를 주먹으로 때려 파손시킴. 손해배상 거부하고 도주함.",
                date = now.minusDays(2).format(DateTimeFormatter.ISO_DATE_TIME),
                views = 1234,
                verified = true,
                images = emptyList(),
                reportedBy = "게임존 PC방 관리자",
                reportDate = now.minusDays(2).format(DateTimeFormatter.ISO_DATE_TIME),
                status = "경찰 신고 완료"
            ),
            Blacklist(
                id = "2",
                name = "박**",
                age = 31,
                gender = "남성",
                phone = "010-****-5678",
                region = "경기",
                pcCafe = "스타 PC방",
                dangerLevel = "경고",
                reason = "음식물 쓰레기 방치",
                description = "배달음식을 시켜먹고 쓰레기를 자리에 그대로 방치. 여러 번 주의를 줬으나 반복적으로 같은 행동 반복.",
                date = now.minusDays(3).format(DateTimeFormatter.ISO_DATE_TIME),
                views = 856,
                verified = true,
                images = emptyList(),
                reportedBy = "스타 PC방 관리자",
                reportDate = now.minusDays(3).format(DateTimeFormatter.ISO_DATE_TIME),
                status = "경고 조치"
            ),
            Blacklist(
                id = "3",
                name = "이**",
                age = 19,
                gender = "남성",
                phone = "010-****-9012",
                region = "부산",
                pcCafe = "메가 PC방",
                dangerLevel = "주의",
                reason = "흡연 및 욕설",
                description = "금연 구역에서 전자담배 흡연. 제지하자 욕설과 협박. 다른 고객들에게도 불쾌감을 줌.",
                date = now.minusDays(4).format(DateTimeFormatter.ISO_DATE_TIME),
                views = 623,
                verified = false,
                images = emptyList(),
                reportedBy = "메가 PC방 관리자",
                reportDate = now.minusDays(4).format(DateTimeFormatter.ISO_DATE_TIME),
                status = "검토 중"
            ),
            Blacklist(
                id = "4",
                name = "최**",
                age = 27,
                gender = "남성",
                phone = "010-****-3456",
                region = "서울",
                pcCafe = "프리미엄 PC방",
                dangerLevel = "위험",
                reason = "음란물 시청",
                description = "성인 PC방임에도 불구하고 음란물을 큰 소리로 시청. 다른 손님들의 항의에도 불구하고 계속 시청. 경찰 신고 후 퇴장.",
                date = now.minusDays(5).format(DateTimeFormatter.ISO_DATE_TIME),
                views = 2103,
                verified = true,
                images = emptyList(),
                reportedBy = "프리미엄 PC방 관리자",
                reportDate = now.minusDays(5).format(DateTimeFormatter.ISO_DATE_TIME),
                status = "경찰 신고 완료"
            ),
            Blacklist(
                id = "5",
                name = "정**",
                age = 35,
                gender = "남성",
                phone = "010-****-7890",
                region = "인천",
                pcCafe = "드림 PC방",
                dangerLevel = "경고",
                reason = "요금 미납",
                description = "12시간 사용 후 요금 결제 거부. CCTV 확인 결과 상습 먹튀범으로 확인됨. 경찰 신고 예정.",
                date = now.minusDays(6).format(DateTimeFormatter.ISO_DATE_TIME),
                views = 945,
                verified = true,
                images = emptyList(),
                reportedBy = "드림 PC방 관리자",
                reportDate = now.minusDays(6).format(DateTimeFormatter.ISO_DATE_TIME),
                status = "검토 중"
            )
        )
    }
}
