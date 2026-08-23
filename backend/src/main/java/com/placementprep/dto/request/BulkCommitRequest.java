package com.placementprep.dto.request;

import com.placementprep.entity.Difficulty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

/**
 * Sent when the admin confirms a bulk upload. Carries only the rows the admin
 * chose to import (typically the ones the preview marked VALID), each already
 * resolved to a concrete chapterId during the validation step.
 */
@Data
public class BulkCommitRequest {

    @NotEmpty
    @Valid
    private List<BulkQuestionItem> questions;

    @Data
    public static class BulkQuestionItem {
        @NotNull
        private Long chapterId;
        private String questionText;
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;
        private String correctOption;
        private String explanation;
        private Difficulty difficulty;
        private Integer estimatedTimeSeconds;
    }
}
