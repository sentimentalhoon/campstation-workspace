package com.campstation.community.config

import io.github.cdimascio.dotenv.dotenv
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.S3Configuration
import java.net.URI

object S3Config {
    private val dotenv = dotenv {
        ignoreIfMissing = true
    }

    val region: String = System.getenv("AWS_REGION") ?: dotenv["AWS_REGION"] ?: "us-east-1"
    val accessKey: String = System.getenv("AWS_ACCESS_KEY_ID") ?: dotenv["AWS_ACCESS_KEY_ID"] ?: ""
    val secretKey: String = System.getenv("AWS_SECRET_ACCESS_KEY") ?: dotenv["AWS_SECRET_ACCESS_KEY"] ?: ""
    val bucketName: String = System.getenv("AWS_S3_BUCKET_NAME") ?: dotenv["AWS_S3_BUCKET_NAME"] ?: "campstation-dev"
    val endpoint: String? = System.getenv("AWS_S3_ENDPOINT") ?: dotenv["AWS_S3_ENDPOINT"]
    val publicEndpoint: String = System.getenv("CLOUD_AWS_S3_PUBLIC_ENDPOINT") 
        ?: dotenv["CLOUD_AWS_S3_PUBLIC_ENDPOINT"] 
        ?: "http://localhost:9000/$bucketName"

    fun createS3Client(): S3Client {
        val credentials = AwsBasicCredentials.create(accessKey, secretKey)
        val credentialsProvider = StaticCredentialsProvider.create(credentials)

        return if (endpoint != null && endpoint.isNotBlank()) {
            // MinIO configuration with path-style access
            println("MinIO S3 client configured for endpoint: $endpoint")
            
            val s3Config = S3Configuration.builder()
                .pathStyleAccessEnabled(true)
                .build()

            S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(credentialsProvider)
                .endpointOverride(URI.create(endpoint))
                .serviceConfiguration(s3Config)
                .build()
        } else {
            // AWS S3 configuration
            println("AWS S3 client configured for region: $region")
            S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(credentialsProvider)
                .build()
        }
    }
}
