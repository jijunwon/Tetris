package com.example.tetris.dto;

import com.example.tetris.domain.Score;
import java.time.LocalDateTime;

public record ScoreResponse(
        Long id,
        String username,
        int score,
        int clearedLines,
        LocalDateTime createdAt
) {
    public static ScoreResponse from(Score score) {
        return new ScoreResponse(
                score.getId(),
                score.getUser().getUsername(),
                score.getScore(),
                score.getClearedLines(),
                score.getCreatedAt()
        );
    }
}