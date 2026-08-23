package com.placementprep.service;

import com.placementprep.dto.response.DashboardStatsResponse;
import com.placementprep.dto.response.ProgressOverviewResponse;
import com.placementprep.dto.response.TestHistorySummaryResponse;
import com.placementprep.entity.Chapter;
import com.placementprep.entity.TestAttempt;
import com.placementprep.entity.TestStatus;
import com.placementprep.entity.User;
import com.placementprep.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final TestAttemptRepository testAttemptRepository;
    private final ChapterRepository chapterRepository;
    private final QuestionRepository questionRepository;
    private final UserDsaProgressRepository userDsaProgressRepository;
    private final DsaProblemRepository dsaProblemRepository;
    private final AuthService authService;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        User currentUser = authService.getCurrentUser();
        Long userId = currentUser.getId();

        List<TestAttempt> completedAttempts = testAttemptRepository.findByUserIdAndStatusOrderByStartedAtDesc(userId, TestStatus.COMPLETED);

        long totalTestsAttempted = completedAttempts.size();
        long questionsSolved = completedAttempts.stream().mapToLong(TestAttempt::getCorrectAnswers).sum();

        Double avgAcc = testAttemptRepository.findAverageAccuracyByUserId(userId);
        double averageAccuracy = avgAcc != null ? Math.round(avgAcc * 10.0) / 10.0 : 0.0;

        int currentStreak = calculateStreak(completedAttempts);

        // Calculate section-wise progress
        long totalAptitudeChapters = chapterRepository.findBySubjectSectionCode("APTITUDE").size();
        long attemptedAptitudeChapters = completedAttempts.stream()
                .filter(t -> t.getChapter() != null && "APTITUDE".equalsIgnoreCase(t.getSectionCode()))
                .map(t -> t.getChapter().getId())
                .distinct()
                .count();
        double aptitudeProgress = totalAptitudeChapters > 0 ? Math.round(((double) attemptedAptitudeChapters / totalAptitudeChapters) * 1000.0) / 10.0 : 0.0;

        long totalCsChapters = chapterRepository.findBySubjectSectionCode("CS_FUNDAMENTALS").size();
        long attemptedCsChapters = completedAttempts.stream()
                .filter(t -> t.getChapter() != null && "CS_FUNDAMENTALS".equalsIgnoreCase(t.getSectionCode()))
                .map(t -> t.getChapter().getId())
                .distinct()
                .count();
        double csProgress = totalCsChapters > 0 ? Math.round(((double) attemptedCsChapters / totalCsChapters) * 1000.0) / 10.0 : 0.0;

        long totalDsa = dsaProblemRepository.count();
        long solvedDsa = userDsaProgressRepository.countByUserIdAndStatus(userId, com.placementprep.entity.DsaStatus.SOLVED);
        double dsaProgress = totalDsa > 0 ? Math.round(((double) solvedDsa / totalDsa) * 1000.0) / 10.0 : 0.0;

        // Group by chapter for Strong vs Weak identification
        Map<Long, List<TestAttempt>> chapterAttemptsMap = completedAttempts.stream()
                .filter(t -> t.getChapter() != null)
                .collect(Collectors.groupingBy(t -> t.getChapter().getId()));

        List<DashboardStatsResponse.ChapterPerformance> performanceList = new ArrayList<>();

        for (Map.Entry<Long, List<TestAttempt>> entry : chapterAttemptsMap.entrySet()) {
            List<TestAttempt> attempts = entry.getValue();
            Chapter chapter = attempts.get(0).getChapter();
            double avgChapterAccuracy = attempts.stream().mapToDouble(TestAttempt::getAccuracy).average().orElse(0.0);
            avgChapterAccuracy = Math.round(avgChapterAccuracy * 10.0) / 10.0;

            String status = "AVERAGE";
            if (avgChapterAccuracy >= 75.0) {
                status = "STRONG";
            } else if (avgChapterAccuracy < 50.0) {
                status = "WEAK";
            }

            performanceList.add(DashboardStatsResponse.ChapterPerformance.builder()
                    .chapterId(chapter.getId())
                    .chapterName(chapter.getName())
                    .subjectName(chapter.getSubject() != null ? chapter.getSubject().getName() : "")
                    .accuracy(avgChapterAccuracy)
                    .testsAttempted(attempts.size())
                    .status(status)
                    .build());
        }

        List<DashboardStatsResponse.ChapterPerformance> strongChapters = performanceList.stream()
                .filter(p -> "STRONG".equals(p.getStatus()))
                .sorted((a, b) -> Double.compare(b.getAccuracy(), a.getAccuracy()))
                .limit(5)
                .collect(Collectors.toList());

        List<DashboardStatsResponse.ChapterPerformance> weakChapters = performanceList.stream()
                .filter(p -> "WEAK".equals(p.getStatus()))
                .sorted(Comparator.comparingDouble(DashboardStatsResponse.ChapterPerformance::getAccuracy))
                .limit(5)
                .collect(Collectors.toList());

        List<TestHistorySummaryResponse> recentTests = completedAttempts.stream().limit(5).map(a -> TestHistorySummaryResponse.builder()
                .id(a.getId())
                .chapterId(a.getChapter() != null ? a.getChapter().getId() : null)
                .chapterName(a.getChapter() != null ? a.getChapter().getName() : "Random Practice")
                .testTitle(a.getTestTitle())
                .sectionCode(a.getSectionCode())
                .totalQuestions(a.getTotalQuestions())
                .correctAnswers(a.getCorrectAnswers())
                .score(a.getScore())
                .accuracy(a.getAccuracy())
                .timeTakenSeconds(a.getTimeTakenSeconds())
                .startedAt(a.getStartedAt())
                .submittedAt(a.getSubmittedAt())
                .status(a.getStatus())
                .build()).collect(Collectors.toList());

        return DashboardStatsResponse.builder()
                .questionsSolved(questionsSolved)
                .totalTestsAttempted(totalTestsAttempted)
                .averageAccuracy(averageAccuracy)
                .currentStreak(currentStreak)
                .aptitudeProgress(aptitudeProgress)
                .csProgress(csProgress)
                .dsaProgress(dsaProgress)
                .strongChapters(strongChapters)
                .weakChapters(weakChapters)
                .recentTests(recentTests)
                .build();
    }

    @Transactional(readOnly = true)
    public ProgressOverviewResponse getOverallProgress() {
        User currentUser = authService.getCurrentUser();
        Long userId = currentUser.getId();

        List<TestAttempt> completedAttempts = testAttemptRepository.findByUserIdAndStatusOrderByStartedAtDesc(userId, TestStatus.COMPLETED);
        long totalTests = completedAttempts.size();
        long totalQuestions = completedAttempts.stream().mapToLong(TestAttempt::getTotalQuestions).sum();
        long totalCorrect = completedAttempts.stream().mapToLong(TestAttempt::getCorrectAnswers).sum();
        double overallAcc = totalQuestions > 0 ? Math.round(((double) totalCorrect / totalQuestions) * 1000.0) / 10.0 : 0.0;

        List<Chapter> allChapters = chapterRepository.findAll();
        Map<Long, List<TestAttempt>> chapterAttemptsMap = completedAttempts.stream()
                .filter(t -> t.getChapter() != null)
                .collect(Collectors.groupingBy(t -> t.getChapter().getId()));

        List<ProgressOverviewResponse.ChapterProgressItem> progressItems = new ArrayList<>();

        for (Chapter chapter : allChapters) {
            List<TestAttempt> attempts = chapterAttemptsMap.getOrDefault(chapter.getId(), Collections.emptyList());
            long totalQ = questionRepository.countByChapterId(chapter.getId());
            long attemptedQ = attempts.stream().mapToLong(TestAttempt::getTotalQuestions).sum();
            double avgAcc = attempts.stream().mapToDouble(TestAttempt::getAccuracy).average().orElse(0.0);
            avgAcc = Math.round(avgAcc * 10.0) / 10.0;

            double completionRate = totalQ > 0 ? Math.min(100.0, Math.round(((double) attemptedQ / totalQ) * 1000.0) / 10.0) : 0.0;

            String mastery = "NOT_STARTED";
            if (!attempts.isEmpty()) {
                if (avgAcc >= 75.0) mastery = "STRONG";
                else if (avgAcc >= 50.0) mastery = "AVERAGE";
                else mastery = "WEAK";
            }

            progressItems.add(ProgressOverviewResponse.ChapterProgressItem.builder()
                    .chapterId(chapter.getId())
                    .chapterName(chapter.getName())
                    .subjectName(chapter.getSubject() != null ? chapter.getSubject().getName() : "")
                    .sectionCode(chapter.getSubject() != null && chapter.getSubject().getSection() != null ? chapter.getSubject().getSection().getCode() : "APTITUDE")
                    .totalQuestions(totalQ)
                    .attemptedQuestions(attemptedQ)
                    .completionRate(completionRate)
                    .accuracy(avgAcc)
                    .attemptsCount(attempts.size())
                    .masteryLevel(mastery)
                    .build());
        }

        return ProgressOverviewResponse.builder()
                .overallAccuracy(overallAcc)
                .totalTests(totalTests)
                .totalQuestionsAttempted(totalQuestions)
                .totalCorrectAnswers(totalCorrect)
                .chapterProgressList(progressItems)
                .build();
    }

    private int calculateStreak(List<TestAttempt> attempts) {
        if (attempts.isEmpty()) return 0;

        Set<LocalDate> dates = attempts.stream()
                .filter(a -> a.getSubmittedAt() != null)
                .map(a -> a.getSubmittedAt().toLocalDate())
                .collect(Collectors.toSet());

        if (dates.isEmpty()) return 0;

        LocalDate today = LocalDate.now();
        LocalDate checkDate = dates.contains(today) ? today : (dates.contains(today.minusDays(1)) ? today.minusDays(1) : null);

        if (checkDate == null) return 0;

        int streak = 0;
        while (dates.contains(checkDate)) {
            streak++;
            checkDate = checkDate.minusDays(1);
        }
        return streak;
    }
}
