package com.example.tetris.dto;

import com.example.tetris.domain.User;

public record UserResponse(
        Long id,
        String username,
        String nickname
) {
    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getUsername(), user.getDisplayName());
    }
}
