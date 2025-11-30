package com.campstation.camp.shared.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * 리소스를 찾을 수 없는 경우 발생하는 예외
 * HTTP 404 Not Found 상태 코드를 반환하는 런타임 예외
 *
 * @author CampStation Team
 * @version 1.0
 * @since 2024-01-01
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
