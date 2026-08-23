package com.placementprep.controller;

import com.placementprep.dto.response.ApiResponse;
import com.placementprep.dto.response.DashboardStatsResponse;
import com.placementprep.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Student dashboard statistics and insights")
public class DashboardController {

    private final AnalyticsService analyticsService;

    @GetMapping
    @Operation(summary = "Get aggregate student dashboard statistics, streak, and recent tests")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats() {
        DashboardStatsResponse response = analyticsService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
