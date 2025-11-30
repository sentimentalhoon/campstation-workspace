package com.campstation.community.database

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import io.github.cdimascio.dotenv.dotenv
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.transaction

object DatabaseFactory {
    private val dotenv = dotenv {
        ignoreIfMissing = true
    }
    
    fun init(
        jdbcUrl: String = dotenv["DB_URL"] ?: System.getenv("DB_URL") ?: "jdbc:postgresql://localhost:5432/community",
        dbUser: String = dotenv["DB_USERNAME"] ?: System.getenv("DB_USERNAME") ?: "postgres",
        dbPassword: String = dotenv["DB_PASSWORD"] ?: System.getenv("DB_PASSWORD") ?: "postgres",
        dbDriver: String = "org.postgresql.Driver"
    ) {
        // Log environment variable loading
        println("=== Database Configuration ===")
        println("dotenv['DB_URL']: ${dotenv["DB_URL"]}")
        println("dotenv['DB_USERNAME']: ${dotenv["DB_USERNAME"]}")
        println("dotenv['DB_PASSWORD']: ${if (dotenv["DB_PASSWORD"] != null) "****" else "null"}")
        println("System.getenv('DB_URL'): ${System.getenv("DB_URL")}")
        println("System.getenv('DB_USERNAME'): ${System.getenv("DB_USERNAME")}")
        println("Final jdbcUrl: $jdbcUrl")
        println("Final dbUser: $dbUser")
        println("Final dbPassword: ${if (dbPassword.isNotEmpty()) "****" else "empty"}")
        println("==============================")
        
        val database = Database.connect(createHikariDataSource(jdbcUrl, dbUser, dbPassword, dbDriver))
        
        transaction(database) {
            SchemaUtils.create(BlacklistTable, BlacklistImageTable)
        }
    }

    private fun createHikariDataSource(
        url: String,
        user: String,
        password: String,
        driver: String
    ): HikariDataSource {
        val config = HikariConfig().apply {
            driverClassName = driver
            jdbcUrl = url
            username = user
            this.password = password
            maximumPoolSize = 10
            isAutoCommit = false
            transactionIsolation = "TRANSACTION_REPEATABLE_READ"
            validate()
        }
        return HikariDataSource(config)
    }
}
