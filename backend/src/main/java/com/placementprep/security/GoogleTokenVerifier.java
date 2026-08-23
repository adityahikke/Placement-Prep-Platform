package com.placementprep.security;

import com.placementprep.exception.BadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Verifies Google Identity Services ID tokens (the {@code credential} returned by
 * the "Sign in with Google" button) and extracts the user's profile.
 *
 * <p>Verification is delegated to Google's {@code tokeninfo} endpoint, which checks
 * the token signature and expiry server-side. We additionally enforce that:
 * <ul>
 *   <li>the {@code aud} (audience) matches one of our configured OAuth client IDs;</li>
 *   <li>the {@code iss} (issuer) is a legitimate Google issuer;</li>
 *   <li>the email is present and marked verified by Google.</li>
 * </ul>
 *
 * <p>This keeps the dependency footprint minimal (no extra crypto libraries). For
 * very high request volumes, swapping in the google-api-client library for fully
 * local verification with cached certificates would avoid the per-login network call.
 */
@Component
public class GoogleTokenVerifier {

    private static final Logger logger = LoggerFactory.getLogger(GoogleTokenVerifier.class);

    private static final String TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo?id_token=";
    private static final Set<String> VALID_ISSUERS = Set.of("accounts.google.com", "https://accounts.google.com");

    @Value("${app.google.client-id:}")
    private String clientIds;

    private final RestTemplate restTemplate = new RestTemplate();

    /** Immutable snapshot of the verified Google profile we care about. */
    public record GoogleUser(String email, String name, String googleId, String pictureUrl) {
    }

    public GoogleUser verify(String idToken) {
        List<String> allowedAudiences = parseClientIds();
        if (allowedAudiences.isEmpty()) {
            throw new BadRequestException(
                    "Google Sign-In is not configured on the server. Set the app.google.client-id property "
                            + "(or GOOGLE_CLIENT_ID environment variable) to your Google OAuth Client ID.");
        }

        Map<String, Object> claims = fetchClaims(idToken);

        // 1. Audience — the token must have been minted for *our* client ID.
        String aud = asString(claims.get("aud"));
        if (aud == null || !allowedAudiences.contains(aud)) {
            logger.warn("Rejected Google token: audience '{}' is not in the allowed client-id list", aud);
            throw new BadRequestException("Google token was not issued for this application.");
        }

        // 2. Issuer — must be Google.
        String iss = asString(claims.get("iss"));
        if (iss == null || !VALID_ISSUERS.contains(iss)) {
            throw new BadRequestException("Google token has an invalid issuer.");
        }

        // 3. Email must exist and be verified.
        String email = asString(claims.get("email"));
        if (email == null || email.isBlank()) {
            throw new BadRequestException("Google account did not provide an email address.");
        }
        boolean emailVerified = Boolean.parseBoolean(asString(claims.get("email_verified")));
        if (!emailVerified) {
            throw new BadRequestException("Your Google email address is not verified.");
        }

        String name = asString(claims.get("name"));
        if (name == null || name.isBlank()) {
            name = email.substring(0, email.indexOf('@'));
        }
        String sub = asString(claims.get("sub"));
        String picture = asString(claims.get("picture"));

        return new GoogleUser(email.toLowerCase().trim(), name, sub, picture);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> fetchClaims(String idToken) {
        if (idToken == null || idToken.isBlank()) {
            throw new BadRequestException("Missing Google credential.");
        }
        try {
            Map<String, Object> response = restTemplate.getForObject(TOKENINFO_URL + idToken, Map.class);
            if (response == null || response.isEmpty()) {
                throw new BadRequestException("Could not verify Google token.");
            }
            return response;
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            // A 4xx from tokeninfo means the token was invalid/expired.
            logger.warn("Google token verification failed: {}", e.getMessage());
            throw new BadRequestException("Invalid or expired Google sign-in. Please try again.");
        }
    }

    private List<String> parseClientIds() {
        if (clientIds == null || clientIds.isBlank()) {
            return List.of();
        }
        return Arrays.stream(clientIds.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    private String asString(Object value) {
        return value == null ? null : value.toString();
    }
}
