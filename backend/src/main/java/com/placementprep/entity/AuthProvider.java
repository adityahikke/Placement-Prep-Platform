package com.placementprep.entity;

/**
 * Identifies how a user authenticates with PlacementPrep.
 *
 * <ul>
 *   <li>{@link #LOCAL} — classic email + password registration/login.</li>
 *   <li>{@link #GOOGLE} — signed in via Google (Google Identity Services ID token).</li>
 * </ul>
 */
public enum AuthProvider {
    LOCAL,
    GOOGLE
}
