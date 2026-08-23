package com.placementprep.service;

import com.placementprep.dto.request.DsaStatusUpdateRequest;
import com.placementprep.dto.response.DsaProblemResponse;
import com.placementprep.entity.Difficulty;
import com.placementprep.entity.DsaProblem;
import com.placementprep.entity.DsaStatus;
import com.placementprep.entity.User;
import com.placementprep.entity.UserDsaProgress;
import com.placementprep.exception.BadRequestException;
import com.placementprep.exception.ResourceNotFoundException;
import com.placementprep.repository.DsaProblemRepository;
import com.placementprep.repository.UserDsaProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DsaService {

    private final DsaProblemRepository dsaProblemRepository;
    private final UserDsaProgressRepository userDsaProgressRepository;
    private final AuthService authService;

    @Transactional(readOnly = true)
    public List<DsaProblemResponse> getAllProblems(String topic, String difficulty) {
        List<DsaProblem> problems;
        if (topic != null && !topic.isBlank()) {
            problems = dsaProblemRepository.findByTopic(topic);
        } else if (difficulty != null && !difficulty.isBlank()) {
            problems = dsaProblemRepository.findByDifficulty(Difficulty.valueOf(difficulty.toUpperCase()));
        } else {
            problems = dsaProblemRepository.findAll();
        }

        Map<Long, DsaStatus> userProgressMap = new HashMap<>();
        try {
            User currentUser = authService.getCurrentUser();
            List<UserDsaProgress> userProgress = userDsaProgressRepository.findByUserId(currentUser.getId());
            for (UserDsaProgress p : userProgress) {
                userProgressMap.put(p.getProblem().getId(), p.getStatus());
            }
        } catch (Exception ignored) {
        }

        return problems.stream().map(p -> DsaProblemResponse.builder()
                .id(p.getId())
                .title(p.getTitle())
                .topic(p.getTopic())
                .difficulty(p.getDifficulty())
                .platform(p.getPlatform())
                .problemUrl(p.getProblemUrl())
                .description(p.getDescription())
                .tags(p.getTags())
                .userStatus(userProgressMap.getOrDefault(p.getId(), DsaStatus.NOT_STARTED))
                .build()
        ).collect(Collectors.toList());
    }

    @Transactional
    public DsaProblemResponse updateProblemStatus(Long problemId, DsaStatusUpdateRequest request) {
        User currentUser = authService.getCurrentUser();
        DsaProblem problem = dsaProblemRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("DSA Problem not found with ID: " + problemId));

        UserDsaProgress progress = userDsaProgressRepository.findByUserIdAndProblemId(currentUser.getId(), problemId)
                .orElse(UserDsaProgress.builder()
                        .user(currentUser)
                        .problem(problem)
                        .status(DsaStatus.NOT_STARTED)
                        .build());

        // SOLVED is sticky. Once a problem is solved we never silently downgrade it —
        // that protects the student's progress from an accidental click. Reopening a
        // solved problem is only allowed when the request explicitly forces it
        // (the UI does this behind a deliberate "undo" confirmation).
        if (progress.getStatus() == DsaStatus.SOLVED
                && request.getStatus() != DsaStatus.SOLVED
                && !request.isForce()) {
            throw new BadRequestException(
                    "This problem is already marked Solved, so its status is locked. "
                            + "Confirm the undo to reopen it.");
        }

        progress.setStatus(request.getStatus());
        userDsaProgressRepository.save(progress);

        return DsaProblemResponse.builder()
                .id(problem.getId())
                .title(problem.getTitle())
                .topic(problem.getTopic())
                .difficulty(problem.getDifficulty())
                .platform(problem.getPlatform())
                .problemUrl(problem.getProblemUrl())
                .description(problem.getDescription())
                .tags(problem.getTags())
                .userStatus(progress.getStatus())
                .build();
    }

    @Transactional(readOnly = true)
    public List<String> getAllTopics() {
        return dsaProblemRepository.findAllDistinctTopics();
    }
}
