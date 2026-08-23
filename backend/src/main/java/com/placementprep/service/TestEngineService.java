package com.placementprep.service;

import com.placementprep.dto.request.RandomTestRequest;
import com.placementprep.dto.request.TestSubmitRequest;
import com.placementprep.dto.response.*;
import com.placementprep.entity.*;
import com.placementprep.exception.BadRequestException;
import com.placementprep.exception.ResourceNotFoundException;
import com.placementprep.exception.UnauthorizedException;
import com.placementprep.repository.ChapterRepository;
import com.placementprep.repository.QuestionRepository;
import com.placementprep.repository.TestAnswerRepository;
import com.placementprep.repository.TestAttemptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TestEngineService {

    private final ChapterRepository chapterRepository;
    private final QuestionRepository questionRepository;
    private final TestAttemptRepository testAttemptRepository;
    private final TestAnswerRepository testAnswerRepository;
    private final AuthService authService;

    @Transactional
    public ActiveTestResponse startChapterTest(Long chapterId) {
        User currentUser = authService.getCurrentUser();
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter not found with ID: " + chapterId));

        // Select 4 Easy, 4 Medium, 2 Hard
        List<Question> selectedQuestions = new ArrayList<>();

        List<Question> easyQuestions = questionRepository.findRandomByChapterIdAndDifficultyNative(chapterId, "EASY", 4);
        List<Question> mediumQuestions = questionRepository.findRandomByChapterIdAndDifficultyNative(chapterId, "MEDIUM", 4);
        List<Question> hardQuestions = questionRepository.findRandomByChapterIdAndDifficultyNative(chapterId, "HARD", 2);

        selectedQuestions.addAll(easyQuestions);
        selectedQuestions.addAll(mediumQuestions);
        selectedQuestions.addAll(hardQuestions);

        // Fallback if difficulty split didn't return 10 questions
        if (selectedQuestions.size() < 10) {
            Set<Long> existingIds = selectedQuestions.stream().map(Question::getId).collect(Collectors.toSet());
            List<Question> allChapterQuestions = questionRepository.findByChapterId(chapterId);
            for (Question q : allChapterQuestions) {
                if (!existingIds.contains(q.getId())) {
                    selectedQuestions.add(q);
                    existingIds.add(q.getId());
                    if (selectedQuestions.size() >= 10) break;
                }
            }
        }

        if (selectedQuestions.isEmpty()) {
            throw new BadRequestException("No questions available for this chapter yet.");
        }

        Collections.shuffle(selectedQuestions);

        String sectionCode = "APTITUDE";
        if (chapter.getSubject() != null && chapter.getSubject().getSection() != null) {
            sectionCode = chapter.getSubject().getSection().getCode();
        }

        TestAttempt testAttempt = TestAttempt.builder()
                .user(currentUser)
                .chapter(chapter)
                .testTitle(chapter.getName() + " Chapter Test")
                .sectionCode(sectionCode)
                .durationSeconds(300) // 5 minutes standard
                .totalQuestions(selectedQuestions.size())
                .status(TestStatus.IN_PROGRESS)
                .build();

        testAttempt = testAttemptRepository.save(testAttempt);

        List<TestAnswer> answers = new ArrayList<>();
        List<ActiveTestQuestionResponse> activeQuestions = new ArrayList<>();

        for (int i = 0; i < selectedQuestions.size(); i++) {
            Question q = selectedQuestions.get(i);
            int order = i + 1;

            TestAnswer testAnswer = TestAnswer.builder()
                    .testAttempt(testAttempt)
                    .question(q)
                    .questionOrder(order)
                    .selectedOption(null)
                    .isCorrect(false)
                    .build();
            answers.add(testAnswer);

            // Strip correctOption and explanation
            activeQuestions.add(ActiveTestQuestionResponse.builder()
                    .id(q.getId())
                    .questionOrder(order)
                    .questionText(q.getQuestionText())
                    .optionA(q.getOptionA())
                    .optionB(q.getOptionB())
                    .optionC(q.getOptionC())
                    .optionD(q.getOptionD())
                    .difficulty(q.getDifficulty())
                    .estimatedTimeSeconds(q.getEstimatedTimeSeconds())
                    .build());
        }

        testAnswerRepository.saveAll(answers);

        return ActiveTestResponse.builder()
                .testId(testAttempt.getId())
                .chapterId(chapter.getId())
                .chapterName(chapter.getName())
                .testTitle(testAttempt.getTestTitle())
                .sectionCode(testAttempt.getSectionCode())
                .startedAt(testAttempt.getStartedAt() != null ? testAttempt.getStartedAt() : LocalDateTime.now())
                .durationSeconds(testAttempt.getDurationSeconds())
                .totalQuestions(selectedQuestions.size())
                .questions(activeQuestions)
                .build();
    }

    @Transactional
    public ActiveTestResponse startRandomTest(RandomTestRequest request) {
        User currentUser = authService.getCurrentUser();
        String sectionCode = request.getSectionCode() != null ? request.getSectionCode().toUpperCase() : "APTITUDE";
        int count = request.getQuestionCount() != null ? request.getQuestionCount() : 10;
        if (count != 10 && count != 20 && count != 30) count = 10;

        List<Question> selectedQuestions;
        String difficulty = request.getDifficulty();
        if (difficulty != null && !difficulty.equalsIgnoreCase("MIXED")) {
            selectedQuestions = questionRepository.findRandomBySectionCodeAndDifficultyNative(sectionCode, difficulty.toUpperCase(), count);
        } else {
            selectedQuestions = questionRepository.findRandomBySectionCodeNative(sectionCode, count);
        }

        if (selectedQuestions.isEmpty()) {
            throw new BadRequestException("No questions available for section " + sectionCode);
        }

        Collections.shuffle(selectedQuestions);

        TestAttempt testAttempt = TestAttempt.builder()
                .user(currentUser)
                .chapter(null)
                .testTitle("Random " + sectionCode + " (" + (difficulty != null ? difficulty : "Mixed") + ") Test")
                .sectionCode(sectionCode)
                .durationSeconds(count * 30) // 30 sec per question
                .totalQuestions(selectedQuestions.size())
                .status(TestStatus.IN_PROGRESS)
                .build();

        testAttempt = testAttemptRepository.save(testAttempt);

        List<TestAnswer> answers = new ArrayList<>();
        List<ActiveTestQuestionResponse> activeQuestions = new ArrayList<>();

        for (int i = 0; i < selectedQuestions.size(); i++) {
            Question q = selectedQuestions.get(i);
            int order = i + 1;

            TestAnswer testAnswer = TestAnswer.builder()
                    .testAttempt(testAttempt)
                    .question(q)
                    .questionOrder(order)
                    .selectedOption(null)
                    .isCorrect(false)
                    .build();
            answers.add(testAnswer);

            activeQuestions.add(ActiveTestQuestionResponse.builder()
                    .id(q.getId())
                    .questionOrder(order)
                    .questionText(q.getQuestionText())
                    .optionA(q.getOptionA())
                    .optionB(q.getOptionB())
                    .optionC(q.getOptionC())
                    .optionD(q.getOptionD())
                    .difficulty(q.getDifficulty())
                    .estimatedTimeSeconds(q.getEstimatedTimeSeconds())
                    .build());
        }

        testAnswerRepository.saveAll(answers);

        return ActiveTestResponse.builder()
                .testId(testAttempt.getId())
                .chapterId(null)
                .chapterName("Random Practice")
                .testTitle(testAttempt.getTestTitle())
                .sectionCode(sectionCode)
                .startedAt(testAttempt.getStartedAt() != null ? testAttempt.getStartedAt() : LocalDateTime.now())
                .durationSeconds(testAttempt.getDurationSeconds())
                .totalQuestions(selectedQuestions.size())
                .questions(activeQuestions)
                .build();
    }

    @Transactional
    public TestResultResponse submitTest(Long testId, TestSubmitRequest request) {
        User currentUser = authService.getCurrentUser();
        TestAttempt testAttempt = testAttemptRepository.findById(testId)
                .orElseThrow(() -> new ResourceNotFoundException("Test attempt not found with ID: " + testId));

        if (!testAttempt.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You do not have access to submit this test attempt");
        }

        if (testAttempt.getStatus() == TestStatus.COMPLETED) {
            return getTestResult(testId);
        }

        LocalDateTime now = LocalDateTime.now();
        testAttempt.setSubmittedAt(now);

        long timeTaken = Duration.between(testAttempt.getStartedAt() != null ? testAttempt.getStartedAt() : now, now).getSeconds();
        testAttempt.setTimeTakenSeconds((int) Math.min(timeTaken, (long) testAttempt.getDurationSeconds() + 10));

        Map<Long, String> submittedAnswersMap = new HashMap<>();
        if (request != null && request.getAnswers() != null) {
            for (TestSubmitRequest.AnswerItem item : request.getAnswers()) {
                if (item.getQuestionId() != null && item.getSelectedAnswer() != null) {
                    submittedAnswersMap.put(item.getQuestionId(), item.getSelectedAnswer().toUpperCase().trim());
                }
            }
        }

        List<TestAnswer> savedAnswers = testAnswerRepository.findByTestAttemptIdOrderByQuestionOrderAsc(testId);
        int correctCount = 0;
        int incorrectCount = 0;
        int unattemptedCount = 0;

        List<QuestionReviewResponse> reviewResponses = new ArrayList<>();

        for (TestAnswer testAnswer : savedAnswers) {
            Question question = testAnswer.getQuestion();
            String studentAnswer = submittedAnswersMap.get(question.getId());

            boolean isCorrect = false;
            if (studentAnswer != null && !studentAnswer.isBlank()) {
                testAnswer.setSelectedOption(studentAnswer);
                if (studentAnswer.equalsIgnoreCase(question.getCorrectOption())) {
                    isCorrect = true;
                    correctCount++;
                } else {
                    incorrectCount++;
                }
            } else {
                testAnswer.setSelectedOption(null);
                unattemptedCount++;
            }

            testAnswer.setIsCorrect(isCorrect);

            reviewResponses.add(QuestionReviewResponse.builder()
                    .questionId(question.getId())
                    .questionOrder(testAnswer.getQuestionOrder())
                    .questionText(question.getQuestionText())
                    .optionA(question.getOptionA())
                    .optionB(question.getOptionB())
                    .optionC(question.getOptionC())
                    .optionD(question.getOptionD())
                    .selectedOption(studentAnswer)
                    .correctOption(question.getCorrectOption())
                    .isCorrect(isCorrect)
                    .explanation(question.getExplanation())
                    .difficulty(question.getDifficulty())
                    .build());
        }

        testAnswerRepository.saveAll(savedAnswers);

        int total = testAttempt.getTotalQuestions() > 0 ? testAttempt.getTotalQuestions() : savedAnswers.size();
        double accuracy = total > 0 ? ((double) correctCount / total) * 100.0 : 0.0;
        double score = (double) correctCount;

        testAttempt.setCorrectAnswers(correctCount);
        testAttempt.setIncorrectAnswers(incorrectCount);
        testAttempt.setUnattemptedQuestions(unattemptedCount);
        testAttempt.setScore(score);
        testAttempt.setAccuracy(Math.round(accuracy * 10.0) / 10.0);
        testAttempt.setStatus(TestStatus.COMPLETED);

        testAttemptRepository.save(testAttempt);

        return TestResultResponse.builder()
                .testId(testAttempt.getId())
                .chapterId(testAttempt.getChapter() != null ? testAttempt.getChapter().getId() : null)
                .chapterName(testAttempt.getChapter() != null ? testAttempt.getChapter().getName() : "Random Practice")
                .testTitle(testAttempt.getTestTitle())
                .sectionCode(testAttempt.getSectionCode())
                .totalQuestions(total)
                .correctAnswers(correctCount)
                .incorrectAnswers(incorrectCount)
                .unattemptedQuestions(unattemptedCount)
                .score(score)
                .accuracy(testAttempt.getAccuracy())
                .durationSeconds(testAttempt.getDurationSeconds())
                .timeTakenSeconds(testAttempt.getTimeTakenSeconds())
                .startedAt(testAttempt.getStartedAt())
                .submittedAt(testAttempt.getSubmittedAt())
                .status(testAttempt.getStatus())
                .reviews(reviewResponses)
                .build();
    }

    @Transactional(readOnly = true)
    public TestResultResponse getTestResult(Long testId) {
        User currentUser = authService.getCurrentUser();
        TestAttempt testAttempt = testAttemptRepository.findById(testId)
                .orElseThrow(() -> new ResourceNotFoundException("Test attempt not found with ID: " + testId));

        if (!testAttempt.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You do not have access to view this test attempt");
        }

        List<TestAnswer> answers = testAnswerRepository.findByTestAttemptIdOrderByQuestionOrderAsc(testId);
        List<QuestionReviewResponse> reviews = answers.stream().map(a -> {
            Question q = a.getQuestion();
            return QuestionReviewResponse.builder()
                    .questionId(q.getId())
                    .questionOrder(a.getQuestionOrder())
                    .questionText(q.getQuestionText())
                    .optionA(q.getOptionA())
                    .optionB(q.getOptionB())
                    .optionC(q.getOptionC())
                    .optionD(q.getOptionD())
                    .selectedOption(a.getSelectedOption())
                    .correctOption(q.getCorrectOption())
                    .isCorrect(a.getIsCorrect())
                    .explanation(q.getExplanation())
                    .difficulty(q.getDifficulty())
                    .build();
        }).collect(Collectors.toList());

        return TestResultResponse.builder()
                .testId(testAttempt.getId())
                .chapterId(testAttempt.getChapter() != null ? testAttempt.getChapter().getId() : null)
                .chapterName(testAttempt.getChapter() != null ? testAttempt.getChapter().getName() : "Random Practice")
                .testTitle(testAttempt.getTestTitle())
                .sectionCode(testAttempt.getSectionCode())
                .totalQuestions(testAttempt.getTotalQuestions())
                .correctAnswers(testAttempt.getCorrectAnswers())
                .incorrectAnswers(testAttempt.getIncorrectAnswers())
                .unattemptedQuestions(testAttempt.getUnattemptedQuestions())
                .score(testAttempt.getScore())
                .accuracy(testAttempt.getAccuracy())
                .durationSeconds(testAttempt.getDurationSeconds())
                .timeTakenSeconds(testAttempt.getTimeTakenSeconds())
                .startedAt(testAttempt.getStartedAt())
                .submittedAt(testAttempt.getSubmittedAt())
                .status(testAttempt.getStatus())
                .reviews(reviews)
                .build();
    }

    @Transactional(readOnly = true)
    public List<TestHistorySummaryResponse> getUserTestHistory() {
        User currentUser = authService.getCurrentUser();
        List<TestAttempt> attempts = testAttemptRepository.findByUserIdOrderByStartedAtDesc(currentUser.getId());

        return attempts.stream().map(a -> TestHistorySummaryResponse.builder()
                .id(a.getId())
                .chapterId(a.getChapter() != null ? a.getChapter().getId() : null)
                .chapterName(a.getChapter() != null ? a.getChapter().getName() : "Random Test")
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
                .build()
        ).collect(Collectors.toList());
    }
}
