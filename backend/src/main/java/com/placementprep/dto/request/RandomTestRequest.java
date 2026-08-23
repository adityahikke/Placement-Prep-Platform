package com.placementprep.dto.request;

import lombok.Data;

@Data
public class RandomTestRequest {
    private String sectionCode; // "APTITUDE" or "CS_FUNDAMENTALS"
    private String difficulty; // "EASY", "MEDIUM", "HARD", or "MIXED"
    private Integer questionCount = 10; // 10, 20, 30
}
