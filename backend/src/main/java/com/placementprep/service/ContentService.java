package com.placementprep.service;

import com.placementprep.dto.response.ChapterResponse;
import com.placementprep.dto.response.SectionResponse;
import com.placementprep.dto.response.SubjectResponse;
import com.placementprep.entity.Chapter;
import com.placementprep.entity.Difficulty;
import com.placementprep.entity.Section;
import com.placementprep.entity.Subject;
import com.placementprep.entity.TestAttempt;
import com.placementprep.exception.ResourceNotFoundException;
import com.placementprep.repository.ChapterRepository;
import com.placementprep.repository.QuestionRepository;
import com.placementprep.repository.SectionRepository;
import com.placementprep.repository.SubjectRepository;
import com.placementprep.repository.TestAttemptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContentService {

    private final SectionRepository sectionRepository;
    private final SubjectRepository subjectRepository;
    private final ChapterRepository chapterRepository;
    private final QuestionRepository questionRepository;
    private final TestAttemptRepository testAttemptRepository;
    private final AuthService authService;

    @Transactional(readOnly = true)
    public List<SectionResponse> getAllSections() {
        List<Section> sections = sectionRepository.findAll();
        return sections.stream().map(this::mapToSectionResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SectionResponse getSectionByCode(String code) {
        Section section = sectionRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Section not found with code: " + code));
        return mapToSectionResponse(section);
    }

    @Transactional(readOnly = true)
    public List<SubjectResponse> getSubjectsBySectionCode(String sectionCode) {
        List<Subject> subjects = subjectRepository.findBySectionCode(sectionCode);
        return subjects.stream().map(this::mapToSubjectResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ChapterResponse getChapterDetails(Long chapterId) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter not found with ID: " + chapterId));
        return mapToChapterResponse(chapter);
    }

    @Transactional(readOnly = true)
    public List<ChapterResponse> getChaptersBySubjectId(Long subjectId) {
        List<Chapter> chapters = chapterRepository.findBySubjectId(subjectId);
        return chapters.stream().map(this::mapToChapterResponse).collect(Collectors.toList());
    }

    private SectionResponse mapToSectionResponse(Section section) {
        List<SubjectResponse> subjectResponses = section.getSubjects().stream()
                .map(this::mapToSubjectResponse)
                .collect(Collectors.toList());

        long totalChapters = section.getSubjects().stream()
                .mapToLong(s -> s.getChapters().size())
                .sum();

        long totalQuestions = section.getSubjects().stream()
                .flatMap(s -> s.getChapters().stream())
                .mapToLong(c -> questionRepository.countByChapterId(c.getId()))
                .sum();

        return SectionResponse.builder()
                .id(section.getId())
                .name(section.getName())
                .code(section.getCode())
                .description(section.getDescription())
                .icon(section.getIcon())
                .subjects(subjectResponses)
                .totalChapters(totalChapters)
                .totalQuestions(totalQuestions)
                .build();
    }

    private SubjectResponse mapToSubjectResponse(Subject subject) {
        List<ChapterResponse> chapterResponses = subject.getChapters().stream()
                .map(this::mapToChapterResponse)
                .collect(Collectors.toList());

        long totalQuestions = subject.getChapters().stream()
                .mapToLong(c -> questionRepository.countByChapterId(c.getId()))
                .sum();

        return SubjectResponse.builder()
                .id(subject.getId())
                .sectionId(subject.getSection() != null ? subject.getSection().getId() : null)
                .name(subject.getName())
                .code(subject.getCode())
                .chapters(chapterResponses)
                .totalQuestions(totalQuestions)
                .build();
    }

    private ChapterResponse mapToChapterResponse(Chapter chapter) {
        long totalQuestions = questionRepository.countByChapterId(chapter.getId());
        long easyQuestions = questionRepository.countByChapterIdAndDifficulty(chapter.getId(), Difficulty.EASY);
        long mediumQuestions = questionRepository.countByChapterIdAndDifficulty(chapter.getId(), Difficulty.MEDIUM);
        long hardQuestions = questionRepository.countByChapterIdAndDifficulty(chapter.getId(), Difficulty.HARD);

        boolean isAttempted = false;
        Double bestScore = null;
        Double lastAccuracy = null;

        try {
            var currentUser = authService.getCurrentUser();
            List<TestAttempt> attempts = testAttemptRepository.findByUserIdAndChapterIdOrderByStartedAtDesc(currentUser.getId(), chapter.getId());
            if (!attempts.isEmpty()) {
                isAttempted = true;
                bestScore = attempts.stream().mapToDouble(TestAttempt::getScore).max().orElse(0.0);
                lastAccuracy = attempts.get(0).getAccuracy();
            }
        } catch (Exception ignored) {
            // Not authenticated or anonymous context
        }

        return ChapterResponse.builder()
                .id(chapter.getId())
                .subjectId(chapter.getSubject() != null ? chapter.getSubject().getId() : null)
                .subjectName(chapter.getSubject() != null ? chapter.getSubject().getName() : "")
                .name(chapter.getName())
                .description(chapter.getDescription())
                .estimatedMinutes(chapter.getEstimatedMinutes())
                .totalQuestions(totalQuestions)
                .easyQuestions(easyQuestions)
                .mediumQuestions(mediumQuestions)
                .hardQuestions(hardQuestions)
                .isAttempted(isAttempted)
                .bestScore(bestScore)
                .lastAccuracy(lastAccuracy)
                .build();
    }
}
