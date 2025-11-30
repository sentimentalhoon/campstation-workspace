package com.campstation.community.models

import kotlinx.serialization.Serializable

enum class ImageType(val value: String) {
    THUMBNAIL("thumbnail"),
    ORIGINAL("original");

    companion object {
        fun fromString(value: String): ImageType = entries.find { it.value == value } ?: ORIGINAL
    }
}

@Serializable
data class BlacklistImage(
    val url: String,
    val type: String = "original"
)

@Serializable
data class Blacklist(
    val id: String,
    val name: String,
    val age: Int,
    val gender: String,
    val phone: String,
    val region: String,
    val pcCafe: String,
    val dangerLevel: String, // "위험", "경고", "주의"
    val reason: String,
    val description: String,
    val detailedInfo: String? = null,
    val date: String, // ISO 8601 format
    val views: Int = 0,
    val verified: Boolean = false,
    val images: List<BlacklistImage> = emptyList(),
    val reportedBy: String,
    val reportDate: String,
    val status: String = "검토 중"
)

@Serializable
data class BlacklistCreateRequest(
    val name: String,
    val age: Int,
    val gender: String,
    val phone: String,
    val region: String,
    val pcCafe: String,
    val dangerLevel: String,
    val reason: String,
    val description: String,
    val detailedInfo: String? = null,
    val reportedBy: String,
    val images: List<String> = emptyList()
)

@Serializable
data class BlacklistFilterRequest(
    val region: String? = null,
    val dangerLevel: String? = null,
    val search: String? = null,
    val sortBy: String? = "latest", // "latest", "views", "danger"
    val page: Int = 1,
    val limit: Int = 20
)

@Serializable
data class BlacklistResponse(
    val items: List<Blacklist>,
    val total: Int,
    val page: Int,
    val totalPages: Int
)

@Serializable
data class BlacklistStats(
    val total: Int,
    val danger: Int,
    val warning: Int,
    val caution: Int
)
