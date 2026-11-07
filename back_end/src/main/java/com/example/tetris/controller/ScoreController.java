package com.example.tetris.controller;

import com.example.tetris.dto.ScoreRequest;
import com.example.tetris.dto.ScoreResponse;
import com.example.tetris.service.ScoreService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/scores")
@RequiredArgsConstructor
public class ScoreController {

    private final ScoreService scoreService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ScoreResponse save(@Valid @RequestBody ScoreRequest request) {
        return scoreService.save(request);
    }

    @GetMapping("/top")
    public List<ScoreResponse> top(@RequestParam(defaultValue = "10") int limit) {
        return scoreService.getTop(limit);
    }
}