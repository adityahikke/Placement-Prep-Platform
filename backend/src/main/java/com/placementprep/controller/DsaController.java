package com.placementprep.controller;

import com.placementprep.dto.request.DsaStatusUpdateRequest;
import com.placementprep.dto.response.ApiResponse;
import com.placementprep.dto.response.DsaProblemResponse;
import com.placementprep.service.DsaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dsa")
@RequiredArgsConstructor
@Tag(name = "DSA Tracker", description = "Endpoints for DSA problems and progress tracking")
public class DsaController {

    private final DsaService dsaService;

    @GetMapping("/problems")
    @Operation(summary = "Get list of DSA problems with optional filters and student status")
    public ResponseEntity<ApiResponse<List<DsaProblemResponse>>> getProblems(
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) String difficulty) {
        List<DsaProblemResponse> response = dsaService.getAllProblems(topic, difficulty);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/problems/{problemId}/status")
    @Operation(summary = "Update problem progress status (NOT_STARTED, ATTEMPTED, SOLVED)")
    public ResponseEntity<ApiResponse<DsaProblemResponse>> updateProblemStatus(
            @PathVariable Long problemId,
            @Valid @RequestBody DsaStatusUpdateRequest request) {
        DsaProblemResponse response = dsaService.updateProblemStatus(problemId, request);
        return ResponseEntity.ok(ApiResponse.success("Status updated successfully", response));
    }

    @GetMapping("/topics")
    @Operation(summary = "Get all distinct DSA topics")
    public ResponseEntity<ApiResponse<List<String>>> getTopics() {
        return ResponseEntity.ok(ApiResponse.success(dsaService.getAllTopics()));
    }
}
