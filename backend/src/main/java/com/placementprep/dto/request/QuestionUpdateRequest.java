package com.placementprep.dto.request;

import com.placementprep.entity.Difficulty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Payload for editing an existing question. Mirrors {@link QuestionCreateRequest};
 * kept as a separate type so the two can evolve independently (PUT vs POST).
 */
@Data
public class QuestionUpdateRequest {
    @NotNull
    private Long chapterId;

    @NotBlank
    private String questionText;

    @NotBlank
    private String optionA;

    @NotBlank
    private String optionB;

    @NotBlank
    private String optionC;

    @NotBlank
    private String optionD;

    @NotBlank
    private String correctOption; // "A", "B", "C", "D"

    private String explanation;

    @NotNull
    private Difficulty difficulty;

    private Integer estimatedTimeSeconds = 30;
}
