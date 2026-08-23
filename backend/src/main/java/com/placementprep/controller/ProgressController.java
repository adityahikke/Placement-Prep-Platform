package com.placementprep.controller;

import com.placementprep.dto.response.ApiResponse;
import com.placementprep.dto.response.ProgressOverviewResponse;
import com.placementprep.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
@Tag(name = "Progress Analytics", description = "Detailed chapter and mastery progress analytics")
public class ProgressController {

    private final AnalyticsService analyticsService;

    @GetMapping("/overall")
    @Operation(summary = "Get detailed progress across all chapters and mastery breakdown")
    public ResponseEntity<ApiResponse<ProgressOverviewResponse>> getOverallProgress() {
        ProgressOverviewResponse response = analyticsService.getOverallProgress();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
