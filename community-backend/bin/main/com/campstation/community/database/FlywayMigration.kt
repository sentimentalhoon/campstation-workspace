package com.campstation.community.database

import org.flywaydb.core.Flyway
import javax.sql.DataSource

object FlywayMigration {
    
    fun migrate(dataSource: DataSource) {
        val flyway = Flyway.configure()
            .dataSource(dataSource)
            .locations("classpath:db/migration")
            .baselineOnMigrate(true)
            .baselineVersion("0")
            .load()
        
        try {
            val info = flyway.info()
            println("=== Flyway Migration Info ===")
            println("Current version: ${info.current()?.version ?: "none"}")
            println("Pending migrations: ${info.pending().size}")
            
            val result = flyway.migrate()
            println("Migrations executed: ${result.migrationsExecuted}")
            println("Success: ${result.success}")
            println("============================")
        } catch (e: Exception) {
            println("Flyway migration failed: ${e.message}")
            e.printStackTrace()
            throw e
        }
    }
    
    fun clean(dataSource: DataSource) {
        val flyway = Flyway.configure()
            .dataSource(dataSource)
            .locations("classpath:db/migration")
            .cleanDisabled(false)
            .load()
        
        flyway.clean()
        println("Database cleaned successfully")
    }
}
