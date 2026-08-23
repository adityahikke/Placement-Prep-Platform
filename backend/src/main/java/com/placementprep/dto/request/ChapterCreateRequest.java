package com.placementprep.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/** Create a new chapter under a subject (admin curriculum management). */
@Data
public class ChapterCreateRequest {

    @NotNull
    private Long subjectId;

    @NotBlank
    private String name;

    private String description;

    /** Suggested test duration in minutes; defaults to 5 when omitted. */
    private Integer estimatedMinutes;
}
