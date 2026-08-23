package com.placementprep.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
public class TestSubmitRequest {

    private List<AnswerItem> answers = new ArrayList<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnswerItem {
        @NotNull
        private Long questionId;
        private String selectedAnswer; // "A", "B", "C", "D" or null
    }
}
