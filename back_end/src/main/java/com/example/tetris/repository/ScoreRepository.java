package com.example.tetris.repository;

import com.example.tetris.domain.Score;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScoreRepository extends JpaRepository<Score, Long> {

    List<Score> findAllByOrderByScoreDesc(Pageable pageable);
}