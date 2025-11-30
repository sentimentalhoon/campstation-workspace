package com.campstation.camp.shared.config;

import java.net.URI;
import java.security.cert.X509Certificate;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.http.SdkHttpClient;
import software.amazon.awssdk.http.apache.ApacheHttpClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;

/**
 * AWS S3 및 MinIO와 호환되는 {@link S3Client} 빈을 구성합니다.
 * <p>
 * Spring Boot 3.x + AWS SDK 2.x 기반의 최신 구성 방식입니다.
 * 환경에 따라 AWS S3 또는 MinIO를 자동으로 선택합니다.
 * </p>
 *
 * <h2>주요 특징</h2>
 * <ul>
 *   <li>환경 변수 기반 엔드포인트 자동 감지</li>
 *   <li>MinIO 호환성을 위한 Path-Style Access 활성화</li>
 *   <li>최신 AWS SDK 2.x 사용</li>
 *   <li>구조적 로깅 지원</li>
 *   <li>Self-signed SSL 인증서 지원 (개발 환경)</li>
 * </ul>
 *
 * @author Choi
 * @since 1.0
 */
@Configuration
@Slf4j
public class S3Config {

    @Value("${cloud.aws.region.static:us-east-1}")
    private String region;

    @Value("${cloud.aws.credentials.access-key}")
    private String accessKey;

    @Value("${cloud.aws.credentials.secret-key}")
    private String secretKey;

    @Value("${cloud.aws.s3.endpoint:#{null}}")
    private String endpoint;

    /**
     * S3 클라이언트를 생성합니다.
     * <p>
     * 엔드포인트가 설정된 경우 MinIO 클라이언트로,
     * 그렇지 않은 경우 AWS S3 클라이언트로 구성합니다.
     * MinIO의 경우 self-signed SSL 인증서를 지원합니다.
     * </p>
     *
     * @return 구성된 S3Client 인스턴스
     */
    @Bean
    public S3Client s3Client() {
        var credentials = AwsBasicCredentials.create(accessKey, secretKey);
        var credentialsProvider = StaticCredentialsProvider.create(credentials);

        S3Client client;
        if (endpoint != null && !endpoint.isBlank()) {
            log.info("MinIO S3 client configured for endpoint: {}", endpoint);
            var s3Config = S3Configuration.builder()
                    .pathStyleAccessEnabled(true)
                    .build();

            var clientBuilder = S3Client.builder()
                    .region(Region.of(region))
                    .credentialsProvider(credentialsProvider)
                    .endpointOverride(URI.create(endpoint))
                    .serviceConfiguration(s3Config);

            // HTTP vs HTTPS 엔드포인트 구분하여 적절한 클라이언트 설정
            if (endpoint.startsWith("http://")) {
                // HTTP 프로토콜: SSL 비활성화
                log.info("HTTP endpoint detected, using plain HTTP client");
                SdkHttpClient httpClient = ApacheHttpClient.builder()
                        .build();
                clientBuilder.httpClient(httpClient);

            } else if (endpoint.startsWith("https://")) {
                // HTTPS 프로토콜: Self-signed 인증서 허용 (개발/테스트 환경)
                try {
                    log.warn("HTTPS endpoint detected, disabling SSL certificate validation (development only)");

                    TrustManager[] trustAllCerts = new TrustManager[] {
                        new X509TrustManager() {
                            public X509Certificate[] getAcceptedIssuers() { return null; }
                            public void checkClientTrusted(X509Certificate[] certs, String authType) { }
                            public void checkServerTrusted(X509Certificate[] certs, String authType) { }
                        }
                    };

                    SSLContext sslContext = SSLContext.getInstance("TLS");
                    sslContext.init(null, trustAllCerts, new java.security.SecureRandom());

                    SdkHttpClient httpClient = ApacheHttpClient.builder()
                            .tlsTrustManagersProvider(() -> trustAllCerts)
                            .build();

                    clientBuilder.httpClient(httpClient);

                } catch (Exception e) {
                    log.error("Failed to configure SSL trust manager", e);
                    throw new RuntimeException("SSL configuration failed for HTTPS endpoint", e);
                }
            }

            client = clientBuilder.build();
        } else {
            log.info("AWS S3 client configured for region: {}", region);
            client = S3Client.builder()
                    .region(Region.of(region))
                    .credentialsProvider(credentialsProvider)
                    .build();
        }

        log.info("S3 client initialized successfully");
        return client;
    }
}
