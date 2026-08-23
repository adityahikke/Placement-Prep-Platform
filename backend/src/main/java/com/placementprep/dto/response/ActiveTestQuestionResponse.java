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
public class ActiveTestQuestionResponse {
    private Long id;
    private Integer questionOrder;
    private String questionText;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private Difficulty difficulty;
    private Integer estimatedTimeSeconds;
}
