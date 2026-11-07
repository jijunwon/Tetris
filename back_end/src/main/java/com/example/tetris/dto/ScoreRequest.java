package com.example.tetris.dto;

import jakarta.validation.constraints.Min;

public record ScoreRequest(
        @Min(0) int score,
        @Min(0) int clearedLines
) {
}