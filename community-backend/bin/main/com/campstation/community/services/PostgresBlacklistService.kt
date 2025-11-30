package com.campstation.community.services

import com.campstation.community.database.BlacklistImageTable
import com.campstation.community.database.BlacklistTable
import com.campstation.community.models.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction
import java.time.LocalDateTime
import java.util.UUID

class PostgresBlacklistService : BlacklistService {

    override suspend fun getAllBlacklists(filter: BlacklistFilterRequest): BlacklistResponse = withContext(Dispatchers.IO) {
        transaction {
            var query = BlacklistTable.selectAll()

            // Apply filters
            filter.region?.takeIf { it != "전체" }?.let { region ->
                query = query.andWhere { BlacklistTable.region eq region }
            }

            filter.dangerLevel?.let { level ->
                query = query.andWhere { BlacklistTable.dangerLevel eq level }
            }

            filter.search?.takeIf { it.isNotBlank() }?.let { searchQuery ->
                query = query.andWhere {
                    (BlacklistTable.reason like "%$searchQuery%") or
                    (BlacklistTable.description like "%$searchQuery%") or
                    (BlacklistTable.pcCafe like "%$searchQuery%")
                }
            }

            // Apply sorting
            query = when (filter.sortBy) {
                "views" -> query.orderBy(BlacklistTable.views, SortOrder.DESC)
                "danger" -> {
                    // Sort by danger level: 위험(3) > 경고(2) > 주의(1)
                    val dangerOrder = BlacklistTable.dangerLevel.case()
                        .When(BlacklistTable.dangerLevel eq "위험", intLiteral(3))
                        .When(BlacklistTable.dangerLevel eq "경고", intLiteral(2))
                        .When(BlacklistTable.dangerLevel eq "주의", intLiteral(1))
                        .Else(intLiteral(0))
                    query.orderBy(dangerOrder, SortOrder.DESC)
                }
                else -> query.orderBy(BlacklistTable.createdAt, SortOrder.DESC)
            }

            // Get total count
            val total = query.count().toInt()
            val totalPages = (total + filter.limit - 1) / filter.limit

            // Apply pagination
            val offset = (filter.page - 1) * filter.limit
            val results = query
                .limit(filter.limit, offset.toLong())
                .map { row -> rowToBlacklist(row) }

            BlacklistResponse(
                blacklists = results,
                total = total,
                page = filter.page,
                totalPages = totalPages
            )
        }
    }

    override suspend fun getBlacklistById(id: String): Blacklist? = withContext(Dispatchers.IO) {
        transaction {
            BlacklistTable.select { BlacklistTable.id eq UUID.fromString(id) }
                .map { rowToBlacklist(it) }
                .singleOrNull()
        }
    }

    override suspend fun createBlacklist(request: BlacklistCreateRequest): Blacklist = withContext(Dispatchers.IO) {
        transaction {
            val now = LocalDateTime.now()
            val blacklistId = UUID.randomUUID()
            
            BlacklistTable.insert {
                it[id] = blacklistId
                it[name] = request.name
                it[maskedName] = maskName(request.name)
                it[age] = request.age
                it[gender] = request.gender
                it[phone] = request.phone
                it[maskedPhone] = maskPhone(request.phone)
                it[region] = request.region
                it[pcCafe] = request.pcCafe
                it[dangerLevel] = request.dangerLevel
                it[reason] = request.reason
                it[description] = request.description
                it[reportedBy] = "익명"
                it[reportDate] = now
                it[status] = "대기 중"
                it[verified] = false
                it[views] = 0
                it[createdAt] = now
                it[updatedAt] = now
            }

            // Insert images
            request.images?.forEach { imageUrl ->
                BlacklistImageTable.insert {
                    it[BlacklistImageTable.blacklistId] = blacklistId
                    it[BlacklistImageTable.imageUrl] = imageUrl
                    it[BlacklistImageTable.createdAt] = now
                }
            }

            getBlacklistById(blacklistId.toString())!!
        }
    }

    override suspend fun incrementViews(id: String): Boolean = withContext(Dispatchers.IO) {
        transaction {
            val updated = BlacklistTable.update({ BlacklistTable.id eq UUID.fromString(id) }) {
                it[views] = BlacklistTable.views plus 1
                it[updatedAt] = LocalDateTime.now()
            }
            updated > 0
        }
    }

    override suspend fun getStats(): BlacklistStats = withContext(Dispatchers.IO) {
        transaction {
            val total = BlacklistTable.selectAll().count().toInt()
            val danger = BlacklistTable.select { BlacklistTable.dangerLevel eq "위험" }.count().toInt()
            val warning = BlacklistTable.select { BlacklistTable.dangerLevel eq "경고" }.count().toInt()
            val caution = BlacklistTable.select { BlacklistTable.dangerLevel eq "주의" }.count().toInt()

            BlacklistStats(
                total = total,
                danger = danger,
                warning = warning,
                caution = caution
            )
        }
    }

    private fun rowToBlacklist(row: ResultRow): Blacklist {
        val blacklistId = row[BlacklistTable.id].value
        val images = transaction {
            BlacklistImageTable
                .select { BlacklistImageTable.blacklistId eq blacklistId }
                .map { it[BlacklistImageTable.imageUrl] }
        }

        return Blacklist(
            id = blacklistId.toString(),
            name = row[BlacklistTable.maskedName],
            age = row[BlacklistTable.age],
            gender = row[BlacklistTable.gender],
            phone = row[BlacklistTable.maskedPhone],
            region = row[BlacklistTable.region],
            pcCafe = row[BlacklistTable.pcCafe],
            dangerLevel = row[BlacklistTable.dangerLevel],
            reason = row[BlacklistTable.reason],
            description = row[BlacklistTable.description],
            date = row[BlacklistTable.createdAt].toString().substring(0, 10),
            views = row[BlacklistTable.views],
            verified = row[BlacklistTable.verified],
            images = images,
            reportedBy = row[BlacklistTable.reportedBy],
            reportDate = row[BlacklistTable.reportDate].toString(),
            status = row[BlacklistTable.status]
        )
    }

    private fun maskName(name: String): String {
        return if (name.length > 1) {
            name.first() + "*".repeat(name.length - 1)
        } else {
            name
        }
    }

    private fun maskPhone(phone: String): String {
        val cleaned = phone.replace("-", "")
        return if (cleaned.length == 11) {
            "${cleaned.substring(0, 3)}-****-${cleaned.substring(7)}"
        } else if (cleaned.length == 10) {
            "${cleaned.substring(0, 3)}-***-${cleaned.substring(6)}"
        } else {
            phone
        }
    }
}
