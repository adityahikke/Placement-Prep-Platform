package com.placementprep.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "dsa_problems")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DsaProblem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String topic; // e.g. "Arrays", "Binary Search", "Dynamic Programming"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty;

    private String platform; // "LeetCode", "GeeksforGeeks", "HackerRank"

    private String problemUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String tags; // e.g. "Prefix Sum, Two Pointers"
}
