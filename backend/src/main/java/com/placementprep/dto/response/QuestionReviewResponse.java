package com.placementprep.dto.response;

import com.placementprep.entity.Difficulty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionReviewResponse {
    private Long questionId;
    private Integer questionOrder;
    private String questionText;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private String selectedOption;
    private String correctOption;
    private Boolean isCorrect;
    private String explanation;
    private Difficulty difficulty;
}
