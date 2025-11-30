package com.campstation.camp.shared.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class RedisTestController {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private JavaMailSender mailSender;

    @GetMapping("/redis")
    public String testRedis() {
        try {
            if (redisTemplate == null) {
                return "Redis 연결 실패: RedisTemplate이 null입니다";
            }

            redisTemplate.opsForValue().set("test", "Hello Redis!");
            Object value = redisTemplate.opsForValue().get("test");
            return "Redis 연결 성공: " + value;
        } catch (Exception e) {
            StringBuilder sb = new StringBuilder();
            sb.append("Redis 연결 실패: ").append(e.getMessage());
            sb.append(" (클래스: ").append(e.getClass().getName()).append(")");
            return sb.toString();
        }
    }

    @GetMapping("/mail")
    public String testMail() {
        try {
            // 간단한 테스트 메일 전송
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo("say4m@naver.com");
            message.setSubject("CampStation - 메일 테스트");
            message.setText("메일 설정 테스트입니다.\n\nCampStation 팀");

            mailSender.send(message);
            return "메일 전송 성공: say4m@naver.com";
        } catch (Exception e) {
            return "메일 전송 실패: " + e.getMessage() + " (클래스: " + e.getClass().getName() + ")";
        }
    }
}
