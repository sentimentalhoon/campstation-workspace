package com.campstation.community.database

import org.jetbrains.exposed.dao.id.UUIDTable
import org.jetbrains.exposed.sql.javatime.datetime

object BlacklistTable : UUIDTable("blacklists") {
    val name = varchar("name", 100)
    val maskedName = varchar("masked_name", 100)
    val age = integer("age")
    val gender = varchar("gender", 10)
    val phone = varchar("phone", 20)
    val maskedPhone = varchar("masked_phone", 20)
    val region = varchar("region", 50)
    val pcCafe = varchar("pc_cafe", 200)
    val dangerLevel = varchar("danger_level", 20)
    val reason = varchar("reason", 100)
    val description = text("description")
    val reportedBy = varchar("reported_by", 100)
    val reportDate = datetime("report_date")
    val status = varchar("status", 50).default("대기 중")
    val verified = bool("verified").default(false)
    val views = integer("views").default(0)
    val createdAt = datetime("created_at")
    val updatedAt = datetime("updated_at")
}

object BlacklistImageTable : UUIDTable("blacklist_images") {
    val blacklistId = reference("blacklist_id", BlacklistTable)
    val imageUrl = varchar("image_url", 500)
    val createdAt = datetime("created_at")
}
