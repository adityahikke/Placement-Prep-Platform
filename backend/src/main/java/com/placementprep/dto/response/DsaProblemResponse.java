package com.placementprep.dto.response;

import com.placementprep.entity.Difficulty;
import com.placementprep.entity.DsaStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DsaProblemResponse {
    private Long id;
    private String title;
    private String topic;
    private Difficulty difficulty;
    private String platform;
    private String problemUrl;
    private String description;
    private String tags;
    private DsaStatus userStatus; // NOT_STARTED, ATTEMPTED, SOLVED
}
