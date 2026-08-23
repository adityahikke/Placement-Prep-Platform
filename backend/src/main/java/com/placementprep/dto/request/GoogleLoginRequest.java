package com.placementprep.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Payload sent by the frontend after Google Identity Services returns a
 * credential. The {@code credential} is a Google-signed JWT ID token that the
 * backend verifies before creating a session.
 */
@Data
public class GoogleLoginRequest {

    @NotBlank(message = "Google credential (ID token) is required")
    private String credential;
}
