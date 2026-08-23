package com.placementprep.service;

import com.placementprep.dto.request.GoogleLoginRequest;
import com.placementprep.dto.request.LoginRequest;
import com.placementprep.dto.request.RegisterRequest;
import com.placementprep.dto.response.AuthResponse;
import com.placementprep.dto.response.UserProfileResponse;
import com.placementprep.entity.AuthProvider;
import com.placementprep.entity.Role;
import com.placementprep.entity.User;
import com.placementprep.exception.BadRequestException;
import com.placementprep.exception.ResourceNotFoundException;
import com.placementprep.repository.UserRepository;
import com.placementprep.security.GoogleTokenVerifier;
import com.placementprep.security.JwtUtils;
import com.placementprep.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final GoogleTokenVerifier googleTokenVerifier;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Error: Email is already in use!");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ROLE_STUDENT)
                .college(request.getCollege())
                .branch(request.getBranch())
                .graduationYear(request.getGraduationYear())
                .build();

        user = userRepository.save(user);

        UserDetailsImpl userDetails = UserDetailsImpl.build(user);
        String jwt = jwtUtils.generateToken(userDetails);

        return buildAuthResponse(user, jwt);
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().toLowerCase().trim(),
                        request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String jwt = jwtUtils.generateToken(userDetails);

        return AuthResponse.builder()
                .token(jwt)
                .type("Bearer")
                .id(userDetails.getId())
                .name(userDetails.getName())
                .email(userDetails.getEmail())
                .role(userDetails.getRole())
                .college(userDetails.getCollege())
                .branch(userDetails.getBranch())
                .graduationYear(userDetails.getGraduationYear())
                .build();
    }

    /**
     * Sign in (or transparently sign up) a student using a Google Identity Services
     * credential. The Google ID token is verified server-side; if no account exists
     * for the verified email we create a lightweight STUDENT account on the fly.
     */
    @Transactional
    public AuthResponse googleLogin(GoogleLoginRequest request) {
        GoogleTokenVerifier.GoogleUser googleUser = googleTokenVerifier.verify(request.getCredential());

        User user = userRepository.findByEmail(googleUser.email())
                .map(existing -> linkGoogleAccount(existing, googleUser))
                .orElseGet(() -> createGoogleUser(googleUser));

        // Issue our own JWT so Google users share the exact same session mechanism
        // as email/password users downstream.
        String jwt = jwtUtils.generateTokenFromUsername(user.getEmail());
        return buildAuthResponse(user, jwt);
    }

    /**
     * A user with this email already exists (they may have registered with
     * email/password first). Backfill the Google identifiers so future logins are
     * recognised, without ever downgrading their role or overwriting their password.
     */
    private User linkGoogleAccount(User user, GoogleTokenVerifier.GoogleUser googleUser) {
        boolean changed = false;
        if (user.getGoogleId() == null) {
            user.setGoogleId(googleUser.googleId());
            changed = true;
        }
        if (user.getPictureUrl() == null && googleUser.pictureUrl() != null) {
            user.setPictureUrl(googleUser.pictureUrl());
            changed = true;
        }
        return changed ? userRepository.save(user) : user;
    }

    private User createGoogleUser(GoogleTokenVerifier.GoogleUser googleUser) {
        User user = User.builder()
                .name(googleUser.name())
                .email(googleUser.email())
                // Google accounts never sign in with a local password, but the column is
                // NOT NULL — store a random, un-guessable hash to satisfy the constraint.
                .password(passwordEncoder.encode("GOOGLE_OAUTH_" + UUID.randomUUID()))
                .role(Role.ROLE_STUDENT)
                .provider(AuthProvider.GOOGLE)
                .googleId(googleUser.googleId())
                .pictureUrl(googleUser.pictureUrl())
                .build();
        return userRepository.save(user);
    }

    /** Builds the standard auth response (JWT + profile summary) from a persisted user. */
    private AuthResponse buildAuthResponse(User user, String jwt) {
        return AuthResponse.builder()
                .token(jwt)
                .type("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .college(user.getCollege())
                .branch(user.getBranch())
                .graduationYear(user.getGraduationYear())
                .build();
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl userDetails)) {
            throw new BadRequestException("No authenticated user found in context");
        }
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public UserProfileResponse getCurrentUserProfile() {
        User user = getCurrentUser();
        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .college(user.getCollege())
                .branch(user.getBranch())
                .graduationYear(user.getGraduationYear())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
