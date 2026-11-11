package com.example.tetris.exception;

import java.util.Map;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler({DuplicateUsernameException.class, DuplicateNicknameException.class})
    @ResponseStatus(HttpStatus.CONFLICT)
    public Map<String, String> duplicate(RuntimeException exception) {
        return Map.of("message", exception.getMessage());
    }

    // 중복 검사와 저장 사이에 같은 아이디·닉네임으로 동시에 가입하면 DB unique 조건에 걸린다.
    @ExceptionHandler(DataIntegrityViolationException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public Map<String, String> constraintViolation() {
        return Map.of("message", "이미 사용 중인 아이디 또는 닉네임입니다.");
    }

    @ExceptionHandler(BadCredentialsException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public Map<String, String> badCredentials() {
        return Map.of("message", "아이디 또는 비밀번호가 올바르지 않습니다.");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> invalid(MethodArgumentNotValidException exception) {
        String message = exception.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getDefaultMessage())
                .orElse("요청 값이 올바르지 않습니다.");
        return Map.of("message", message);
    }
}
