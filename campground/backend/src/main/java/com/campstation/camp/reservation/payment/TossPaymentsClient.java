package com.campstation.camp.reservation.payment;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Component;

import com.campstation.camp.shared.config.TossPaymentsConfig;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

import lombok.extern.slf4j.Slf4j;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

/**
 * 토스페이먼츠 API 클라이언트
 * 
 * 토스페이먼츠 REST API를 호출하여 결제 관련 기능 제공:
 * - 결제 승인 (confirmPayment): 프론트엔드에서 받은 결제 정보를 최종 승인
 * - 결제 조회 (getPayment): 결제 상태 및 상세 정보 조회
 * - 결제 취소 (cancelPayment): 결제 취소 및 환불 처리
 * 
 * 토스페이먼츠 결제 흐름:
 * 1. 프론트엔드에서 결제창 띄우기 (Client Key 사용)
 * 2. 사용자 결제 진행
 * 3. 결제 성공 시 paymentKey, orderId, amount 받음
 * 4. 백엔드에서 confirmPayment() 호출하여 최종 승인 (Secret Key 사용)
 * 
 * @see <a href="https://docs.tosspayments.com/reference">토스페이먼츠 API 문서</a>
 */
@Slf4j
@Component
public class TossPaymentsClient {
    
    private final TossPaymentsConfig config;
    private final Gson gson = new Gson();
    private final OkHttpClient httpClient;
    
    /**
     * OkHttpClient 초기화 (생성자에서 설정)
     */
    public TossPaymentsClient(TossPaymentsConfig config) {
        this.config = config;
        this.httpClient = new OkHttpClient.Builder()
                .connectTimeout(config.getTimeout(), TimeUnit.MILLISECONDS)
                .writeTimeout(config.getTimeout(), TimeUnit.MILLISECONDS)
                .readTimeout(config.getTimeout(), TimeUnit.MILLISECONDS)
                .build();
    }
    
    /**
     * 결제 승인 (Payment Confirmation)
     * 
     * 프론트엔드에서 결제 완료 후 받은 정보로 최종 승인 처리합니다.
     * - paymentKey: 토스페이먼츠에서 발급한 결제 고유 키
     * - orderId: 가맹점에서 생성한 주문 ID
     * - amount: 실제 결제 금액 (위변조 방지를 위한 검증)
     * 
     * @param paymentKey 토스페이먼츠 결제 키
     * @param orderId 주문 ID
     * @param amount 결제 금액
     * @return 승인된 결제 정보 (status, method, approvedAt 등)
     * @throws IOException API 호출 실패 시
     */
    public JsonObject confirmPayment(String paymentKey, String orderId, int amount) 
            throws IOException {
        log.info("TossPayments confirmPayment - paymentKey: {}, orderId: {}, amount: {}", 
                paymentKey, orderId, amount);
        
        // 요청 바디 생성
        JsonObject requestBody = new JsonObject();
        requestBody.addProperty("paymentKey", paymentKey);
        requestBody.addProperty("orderId", orderId);
        requestBody.addProperty("amount", amount);
        
        String url = config.getBaseUrl() + "/v1/payments/confirm";
        RequestBody body = RequestBody.create(
                gson.toJson(requestBody),
                MediaType.parse("application/json; charset=utf-8")
        );
        
        Request request = new Request.Builder()
                .url(url)
                .addHeader("Authorization", getBasicAuthHeader())
                .addHeader("Content-Type", "application/json")
                .post(body)
                .build();
        
        try (Response response = httpClient.newCall(request).execute()) {
            String responseBody = response.body() != null ? response.body().string() : "";
            log.debug("TossPayments confirmPayment response: {}", responseBody);
            
            if (!response.isSuccessful()) {
                log.error("TossPayments confirmPayment failed - code: {}, body: {}", 
                        response.code(), responseBody);
                throw new IOException("Failed to confirm payment: " + responseBody);
            }
            
            JsonObject result = gson.fromJson(responseBody, JsonObject.class);
            log.info("Payment confirmation successful - paymentKey: {}, orderId: {}", 
                    paymentKey, orderId);
            return result;
        }
    }
    
    /**
     * 결제 조회 (Get Payment)
     * 
     * paymentKey로 결제 상세 정보를 조회합니다.
     * - 결제 상태 확인 (DONE, CANCELED, FAILED 등)
     * - 결제 금액, 결제 방법, 승인 시간 등
     * 
     * @param paymentKey 토스페이먼츠 결제 키
     * @return 결제 상세 정보
     * @throws IOException API 호출 실패 시
     */
    public JsonObject getPayment(String paymentKey) throws IOException {
        log.info("TossPayments getPayment - paymentKey: {}", paymentKey);
        
        String url = config.getBaseUrl() + "/v1/payments/" + paymentKey;
        Request request = new Request.Builder()
                .url(url)
                .addHeader("Authorization", getBasicAuthHeader())
                .get()
                .build();
        
        try (Response response = httpClient.newCall(request).execute()) {
            String responseBody = response.body() != null ? response.body().string() : "";
            log.debug("TossPayments getPayment response: {}", responseBody);
            
            if (!response.isSuccessful()) {
                log.error("TossPayments getPayment failed - code: {}, body: {}", 
                        response.code(), responseBody);
                throw new IOException("Failed to get payment: " + responseBody);
            }
            
            return gson.fromJson(responseBody, JsonObject.class);
        }
    }
    
    /**
     * 결제 취소 (Cancel Payment)
     * 
     * 완료된 결제를 취소하고 환불 처리합니다.
     * - 전액 취소 또는 부분 취소 가능
     * - 취소 사유 필수 입력
     * 
     * @param paymentKey 토스페이먼츠 결제 키
     * @param cancelReason 취소 사유
     * @param cancelAmount 취소 금액 (null이면 전액 취소)
     * @return 취소 결과 (canceledAt, cancelAmount 등)
     * @throws IOException API 호출 실패 시
     */
    public JsonObject cancelPayment(String paymentKey, String cancelReason, Integer cancelAmount) 
            throws IOException {
        log.info("TossPayments cancelPayment - paymentKey: {}, reason: {}, amount: {}", 
                paymentKey, cancelReason, cancelAmount);
        
        // 요청 바디 생성
        JsonObject requestBody = new JsonObject();
        requestBody.addProperty("cancelReason", cancelReason);
        if (cancelAmount != null) {
            requestBody.addProperty("cancelAmount", cancelAmount);
        }
        
        String url = config.getBaseUrl() + "/v1/payments/" + paymentKey + "/cancel";
        RequestBody body = RequestBody.create(
                gson.toJson(requestBody),
                MediaType.parse("application/json; charset=utf-8")
        );
        
        Request request = new Request.Builder()
                .url(url)
                .addHeader("Authorization", getBasicAuthHeader())
                .addHeader("Content-Type", "application/json")
                .post(body)
                .build();
        
        try (Response response = httpClient.newCall(request).execute()) {
            String responseBody = response.body() != null ? response.body().string() : "";
            log.debug("TossPayments cancelPayment response: {}", responseBody);
            
            if (!response.isSuccessful()) {
                log.error("TossPayments cancelPayment failed - code: {}, body: {}", 
                        response.code(), responseBody);
                throw new IOException("Failed to cancel payment: " + responseBody);
            }
            
            JsonObject result = gson.fromJson(responseBody, JsonObject.class);
            log.info("Payment cancellation successful - paymentKey: {}", paymentKey);
            return result;
        }
    }
    
    /**
     * Basic 인증 헤더 생성
     * 
     * 토스페이먼츠 API는 Secret Key를 Base64 인코딩하여 사용
     * Format: "Basic {Base64(secretKey + ':')}"
     * 
     * @return Authorization 헤더 값
     */
    private String getBasicAuthHeader() {
        String credentials = config.getSecretKey() + ":";
        String encoded = Base64.getEncoder()
                .encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
        return "Basic " + encoded;
    }
}
