package com.campstation.community.models

import kotlinx.serialization.SerialName
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
    val odds: MatchOdds? = null,
    val elapsed: Int? = null, // Minutes elapsed (for LIVE matches)
    val country: String? = null, // League country
    val homeTeamLogo: String? = null, // Home team logo URL
    val awayTeamLogo: String? = null // Away team logo URL
)

@Serializable
data class MatchOdds(
    val homeWin: Double,
    val draw: Double,
    val awayWin: Double
)

// API-Football Response Models
@Serializable
data class ApiFootballResponse(
    val response: List<ApiFixture>
)

@Serializable
data class ApiFixture(
    val fixture: FixtureInfo,
    val league: LeagueInfo,
    val teams: TeamsInfo,
    val goals: GoalsInfo
)

@Serializable
data class FixtureInfo(
    val id: Long,
    val date: String,
    val status: StatusInfo
)

@Serializable
data class StatusInfo(
    val long: String,
    val short: String, // "1H", "2H", "HT", "FT", "NS" (Not Started)
    val elapsed: Int? = null
)

@Serializable
data class LeagueInfo(
    val name: String,
    val country: String,
    val flag: String? = null
)

@Serializable
data class TeamsInfo(
    val home: TeamInfo,
    val away: TeamInfo
)

@Serializable
data class TeamInfo(
    val id: Long,
    val name: String,
    val logo: String? = null,
    val winner: Boolean? = null
)

@Serializable
data class GoalsInfo(
    val home: Int? = null,
    val away: Int? = null
)

