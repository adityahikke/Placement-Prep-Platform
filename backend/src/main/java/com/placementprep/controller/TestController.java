package com.placementprep.controller;

import com.placementprep.dto.request.RandomTestRequest;
import com.placementprep.dto.request.TestStartRequest;
import com.placementprep.dto.request.TestSubmitRequest;
import com.placementprep.dto.response.ActiveTestResponse;
import com.placementprep.dto.response.ApiResponse;
import com.placementprep.dto.response.TestHistorySummaryResponse;
import com.placementprep.dto.response.TestResultResponse;
import com.placementprep.service.TestEngineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tests")
@RequiredArgsConstructor
@Tag(name = "Test Engine", description = "Endpoints for starting, taking, submitting tests, and viewing results")
public class TestController {

    private final TestEngineService testEngineService;

    @PostMapping("/start")
    @Operation(summary = "Start a 5-minute timed test for a specific chapter (10 random questions: 4 Easy, 4 Medium, 2 Hard)")
    public ResponseEntity<ApiResponse<ActiveTestResponse>> startChapterTest(@Valid @RequestBody TestStartRequest request) {
        ActiveTestResponse response = testEngineService.startChapterTest(request.getChapterId());
        return ResponseEntity.ok(ApiResponse.success("Test started successfully", response));
    }

    @PostMapping("/random")
    @Operation(summary = "Start a randomized test with customized filters (Section, Difficulty, Question Count)")
    public ResponseEntity<ApiResponse<ActiveTestResponse>> startRandomTest(@Valid @RequestBody RandomTestRequest request) {
        ActiveTestResponse response = testEngineService.startRandomTest(request);
        return ResponseEntity.ok(ApiResponse.success("Random test started successfully", response));
    }

    @PostMapping("/{testId}/submit")
    @Operation(summary = "Submit a test attempt and calculate score, accuracy, and detailed explanations")
    public ResponseEntity<ApiResponse<TestResultResponse>> submitTest(
            @PathVariable Long testId,
            @RequestBody TestSubmitRequest request) {
        TestResultResponse response = testEngineService.submitTest(testId, request);
        return ResponseEntity.ok(ApiResponse.success("Test submitted successfully", response));
    }

    @GetMapping("/{testId}/result")
    @Operation(summary = "Get the result and question-by-question review of a previously completed test")
    public ResponseEntity<ApiResponse<TestResultResponse>> getTestResult(@PathVariable Long testId) {
        TestResultResponse response = testEngineService.getTestResult(testId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/history")
    @Operation(summary = "Get all past test attempts history for the logged-in student")
    public ResponseEntity<ApiResponse<List<TestHistorySummaryResponse>>> getTestHistory() {
        List<TestHistorySummaryResponse> response = testEngineService.getUserTestHistory();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
