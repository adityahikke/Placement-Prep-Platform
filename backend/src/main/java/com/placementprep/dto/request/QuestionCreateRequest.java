package com.placementprep.dto.request;

import com.placementprep.entity.Difficulty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class QuestionCreateRequest {
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
