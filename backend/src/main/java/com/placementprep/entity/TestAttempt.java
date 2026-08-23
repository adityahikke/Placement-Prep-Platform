package com.placementprep.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "test_attempts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"password", "testAttempts"})
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chapter_id", nullable = true)
    private Chapter chapter;

    private String testTitle; // e.g. "Percentage Chapter Test" or "Random Mixed Test"

    private String sectionCode; // "APTITUDE", "CS_FUNDAMENTALS"

    @CreationTimestamp
    private LocalDateTime startedAt;

    private LocalDateTime submittedAt;

    @Builder.Default
    private Integer durationSeconds = 300; // 5 minutes

    private Integer timeTakenSeconds;

    @Builder.Default
    private Integer totalQuestions = 10;

    @Builder.Default
    private Integer correctAnswers = 0;

    @Builder.Default
    private Integer incorrectAnswers = 0;

    @Builder.Default
    private Integer unattemptedQuestions = 0;

    @Builder.Default
    private Double score = 0.0;

    @Builder.Default
    private Double accuracy = 0.0;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TestStatus status = TestStatus.IN_PROGRESS;

    @OneToMany(mappedBy = "testAttempt", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("testAttempt")
    @Builder.Default
    private List<TestAnswer> answers = new ArrayList<>();
}
