package com.campstation.community.models

import kotlinx.serialization.Serializable

@Serializable
data class Match(
    val id: String,
    val league: String,
    val homeTeam: String,
    val awayTeam: String,
    val startTime: String,
    val status: String, // "SCHEDULED", "LIVE", "FINISHED"
    val homeScore: Int? = null,
    val awayScore: Int? = null,
    val odds: MatchOdds? = null
)

@Serializable
data class MatchOdds(
    val homeWin: Double,
    val draw: Double,
    val awayWin: Double
)
