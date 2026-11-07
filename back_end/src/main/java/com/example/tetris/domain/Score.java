package com.example.tetris.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Score {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int score;

    private int clearedLines;

    private LocalDateTime createdAt;

    public Score(int score, int clearedLines) {
        this.score = score;
        this.clearedLines = clearedLines;
        this.createdAt = LocalDateTime.now();
    }
}