package com.campstation.camp.shared.config;

import java.util.concurrent.Executor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.TaskExecutor;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

/**
 * 비동기 이벤트 처리를 위한 스레드 풀 설정.
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "alertTaskExecutor")
    public TaskExecutor alertTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("alert-async-");
        executor.initialize();
        return executor;
    }

    @Bean
    public Executor taskExecutor() {
        return alertTaskExecutor();
    }
}
