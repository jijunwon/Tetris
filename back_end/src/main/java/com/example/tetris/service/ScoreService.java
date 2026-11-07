package com.example.tetris.service;

import com.example.tetris.domain.Score;
import com.example.tetris.dto.ScoreRequest;
import com.example.tetris.dto.ScoreResponse;
import com.example.tetris.repository.ScoreRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ScoreService {

    private final ScoreRepository scoreRepository;

    @Transactional
    public ScoreResponse save(ScoreRequest request) {
        Score saved = scoreRepository.save(new Score(request.score(), request.clearedLines()));
        return ScoreResponse.from(saved);
    }

    public List<ScoreResponse> getTop(int limit) {
        int size = Math.clamp(limit, 1, 100);
        return scoreRepository.findAllByOrderByScoreDesc(PageRequest.of(0, size)).stream()
                .map(ScoreResponse::from)
                .toList();
    }
}