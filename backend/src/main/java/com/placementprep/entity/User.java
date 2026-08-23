package com.placementprep.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String college;

    private String branch;

    private Integer graduationYear;

    /**
     * How the account authenticates: LOCAL (email + password) or GOOGLE (OAuth sign-in).
     * Google-only accounts still store a random hashed password so the NOT NULL
     * constraint holds, but they are never expected to log in with it.
     */
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private AuthProvider provider = AuthProvider.LOCAL;

    /** Google "sub" (stable subject id) for accounts that signed in with Google. */
    @Column(name = "google_id")
    private String googleId;

    /** Optional profile picture URL supplied by Google. */
    @Column(name = "picture_url", length = 1024)
    private String pictureUrl;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
