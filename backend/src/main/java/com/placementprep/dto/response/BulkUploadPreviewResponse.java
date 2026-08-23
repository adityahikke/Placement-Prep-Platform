package com.placementprep.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Result of validating a bulk-upload file BEFORE anything is written. The admin
 * reviews this preview, then the frontend sends the valid rows back to be committed.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkUploadPreviewResponse {
    private int totalRows;
    private int validCount;
    private int invalidCount;
    private int duplicateCount;
    private List<BulkRowResult> rows;

    /** One parsed spreadsheet/CSV row, annotated with its validation outcome. */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BulkRowResult {
        /** 1-based row number as it appears in the file (excluding the header). */
        private int rowNumber;
        /** VALID, INVALID, or DUPLICATE. */
        private String status;
        private List<String> errors;

        // Raw values as read from the file (echoed back for display).
        private String section;
        private String chapter;
        private String question;
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;
        private String correctAnswer;
        private String difficulty;
        private String explanation;

        // Resolved on the server when the row is valid, so commit needs no re-lookup.
        private Long chapterId;
    }
}
