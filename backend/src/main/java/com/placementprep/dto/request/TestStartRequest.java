package com.placementprep.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TestStartRequest {
    @NotNull(message = "Chapter ID is required")
    private Long chapterId;
}
