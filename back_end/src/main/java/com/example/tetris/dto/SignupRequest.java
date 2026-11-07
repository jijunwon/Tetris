package com.example.tetris.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SignupRequest(
        @NotBlank(message = "아이디를 입력하세요.")
        @Size(min = 2, max = 20, message = "아이디는 2자 이상 20자 이하여야 합니다.")
        String username,
        @NotBlank(message = "비밀번호를 입력하세요.")
        @Size(min = 4, max = 72, message = "비밀번호는 4자 이상이어야 합니다.")
        String password
) {
}
