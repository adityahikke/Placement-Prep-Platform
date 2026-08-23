package com.placementprep.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Edit an existing chapter. An optional {@code subjectId} allows moving the chapter
 * to another subject; when null the chapter stays under its current subject.
 */
@Data
public class ChapterUpdateRequest {

    @NotBlank
    private String name;

    private String description;

    private Integer estimatedMinutes;

    /** Optional: move the chapter to a different subject. */
    private Long subjectId;
}
