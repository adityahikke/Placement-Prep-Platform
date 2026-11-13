# PlacementPrep Production Audit Report

Audit date: 2026-11-14
Repository: `main` at the checked-out revision; backup branch: `codex/placementprep-pre-audit-backup`
Scope: repository review, local build/smoke checks, and low-volume read-only/credential verification against the supplied production URLs.

## Executive status

**NOT PRODUCTION READY until the active published demo accounts are reset and the updated backend is deployed.** Production currently responds, and both documented demo accounts can log in; the administrator account returns `ROLE_ADMIN`. Supabase dashboard access was unavailable because the dashboard requested sign-in. No production database changes were made.

The observed login network error is consistent with the Render service being asleep or waking: an initial health and CORS preflight request timed out without a response, while later health, preflight, successful demo logins, and invalid-password login requests received normal HTTP responses. This identifies an intermittent backend availability/cold-start path, not an incorrect production frontend API hostname. Render logs and service settings were unavailable, so the exact instance event behind the user's earlier report cannot be proven.

## Issue inventory

| # | Severity | Finding | Status |
|---|---|---|---|
| 1 | CRITICAL | Published student and administrator demo passwords are live. Production login returned success for both; the administrator receives `ROLE_ADMIN`. | Removed from source seeding, login UI, and README. Existing production accounts still need password rotation. |
| 2 | CRITICAL | A weak JWT fallback key was committed in `application.yml` and README examples. | Fallback and literal examples removed. Production `JWT_SECRET` must be replaced with a unique key; production environment could not be inspected. |
| 3 | HIGH | Render container entrypoints forced port 8080, overriding Spring's `${PORT}` configuration. | Fixed in both Dockerfiles; un-deployed. |
| 4 | HIGH | Public `/api/auth/**` access also made `/api/auth/me` publicly routable. | Public match narrowed to login, registration, and Google login. `/me` returned 401 unauthenticated in local smoke. |
| 5 | HIGH | CORS accepted every origin and allowed credentials. | Replaced with a configurable origin allowlist; bearer-token flow does not allow cookies. |
| 6 | HIGH | No request throttling/brute-force control was found for login or registration. | Open. Needs a distributed rate limit or edge/WAF policy; per-instance memory limits would not be sufficient for multiple Render instances. |
| 7 | HIGH | First production probes timed out; subsequent probes succeeded, consistent with Render cold start/wake delay. | Auth calls now time out after 90 seconds and show a useful availability message; deploy and measure. Render logs were unavailable. |
| 8 | MEDIUM | Health endpoint always returned UP without checking PostgreSQL. | `/api/health` now performs a bounded connection validation and returns 503 on DB failure; un-deployed. |
| 9 | MEDIUM | Unhandled API errors exposed exception text to clients. | Response now hides internals; database unavailability maps to 503 and integrity conflicts to 409. |
| 10 | MEDIUM | Hikari pool sizing was implicit and could multiply across instances. | Configured conservative per-instance default maximum of 5 and configurable timeouts. Supabase connection ceiling and Render instance count remain unknown. |
| 11 | MEDIUM | Production frontend silently defaulted to same-origin `/api` if `VITE_API_BASE_URL` was missing. | Production builds now fail fast on missing API URL. Production bundle was verified to target the current Render URL. |
| 12 | MEDIUM | README documented the stale Render hostname. | Updated to the current URL in repository documentation. The deployed Vercel bundle already used the current URL. |
| 13 | MEDIUM | Hibernate schema evolution uses `ddl-auto: update`; no versioned SQL migrations exist in the repository. | Open; no schema migration was needed or applied. Replace with reviewed migrations before ongoing schema changes. |
| 14 | MEDIUM | No automated backend test sources, integration tests, or end-to-end tests exist. | Open; no test suite was added. Maven test lifecycle compiles successfully but reports no test sources. |
| 15 | MEDIUM | Production database schema, policies, indexes, grants, connection settings, and existing account hashes could not be inspected. | Open; no database mutation or production load test was performed. |

**Count:** 15 findings: 2 critical, 5 high, 8 medium. Eleven have repository-level remediations; production deployment, live secret rotation, and the explicit open findings above remain outstanding.

## Login and endpoint evidence

Production frontend asset `index-DgNgk4er.js` contains `https://placement-prep-platform-2.onrender.com`; it does not target the old documented host.

Observed production behavior during this audit:

- `GET /api/health`: initially timed out with no response; later returned HTTP 200 and `status: UP`.
- `OPTIONS /api/auth/login` from `https://apticode-rho.vercel.app`: initially timed out; later returned HTTP 200 and allowed that origin.
- `POST /api/auth/login`, published student credentials: HTTP 200, success, student role.
- `POST /api/auth/login`, published administrator credentials: HTTP 200, success, admin role.
- `POST /api/auth/login`, invalid credentials: HTTP 401.
- Old host `https://placementprep-backend.onrender.com/api/health`: HTTP 404 from an Express server, not this Spring application.

These checks used a small number of requests only. Successful later responses show the login route is reachable and handles valid/invalid credentials, while the initial timeouts show intermittent availability. They do not establish current error rates or database performance. No Render logs were available to tie the first timeout to a specific startup or exception.

Local isolated H2 smoke checks against the changed code passed: student registration, case-insensitive login, authenticated `/api/auth/me`, unauthenticated `/api/auth/me` returning 401, invalid password returning 401, DB-aware health returning UP, and allowed-origin preflight returning 200. This did not use Supabase or production records.

## Code changes

- Both Dockerfiles now use `exec` and let Spring honor Render's injected `PORT`; the initial JVM heap was reduced to 128 MB while preserving the 384 MB maximum.
- `application.yml` requires `JWT_SECRET`, adds CORS allowlist configuration, and bounds Hikari at five connections per instance by default with explicit timeouts.
- CORS is limited to the configured Vercel and local origins by default and does not allow cookies.
- `/api/auth/me` now requires JWT authentication.
- Authentication lookup and duplicate checks are case-insensitive.
- Health check verifies database connectivity.
- API errors no longer return exception messages; DB failures and integrity conflicts have deliberate status codes.
- Login, registration, Google login, and session validation have a 90-second request timeout for Render wake delays; other API calls have a 20-second timeout.
- Demo login fill, demo account seeding, README demo passwords, old backend references, and the committed JWT fallback example were removed.

Files modified: root `Dockerfile`, `README.md`, `backend/Dockerfile`, `backend/src/main/java/com/placementprep/config/CorsConfig.java`, `DataInitializer.java`, `SecurityConfig.java`, `backend/src/main/java/com/placementprep/controller/HealthController.java`, `backend/src/main/java/com/placementprep/exception/GlobalExceptionHandler.java`, `backend/src/main/java/com/placementprep/repository/UserRepository.java`, `backend/src/main/java/com/placementprep/security/UserDetailsServiceImpl.java`, `backend/src/main/java/com/placementprep/service/AuthService.java`, `backend/src/main/resources/application.yml`, `frontend/src/api/axiosClient.js`, `frontend/src/api/index.js`, `frontend/src/pages/Login.jsx`.

No SQL migration was created. No production records were deleted or modified.

## Build and test results

- `mvn -B test`: BUILD SUCCESS; 95 backend source files compiled; no test sources were present.
- `npm run build`: passed; Vite generated a 454.75 kB JS bundle (123.75 kB gzip) and 57.48 kB CSS (9.59 kB gzip).
- `git diff --check`: passed.
- Frontend lint: no lint script is defined in `frontend/package.json`.
- End-to-end, Google OAuth, Supabase integration, full feature permission, browser console, and dependency vulnerability scans: not run.

## Database, feature, security, and scalability limits

The application uses PostgreSQL through Spring Data JPA; it does not use Supabase Auth. The production Supabase dashboard required sign-in, and no production JDBC credentials or database connector were available. Tables, indexes, RLS, permissions, live schema drift, query plans, and pool limits therefore remain unverified. No production write was attempted.

Repository review found role-protected admin controllers and ownership checks on test result/submit and DSA progress paths. These were reviewed statically, not exhaustively exercised. Google token verification checks issuer, audience, and verified email in code; production OAuth client configuration and browser flow remain unverified. There is no rate limiting. No frontend secrets were detected in the checked production bundle beyond public endpoints and the public Google client ID.

Features present in source include student registration/login/Google login, dashboard, aptitude/content, timed and random tests, submission/results/history, CS fundamentals, DSA tracking, analytics, profile, and admin dashboard/student/question/bulk upload/curriculum/DSA management. Only the auth smoke subset was dynamically tested. No 50–1,000 user load tests were run, and no production load was generated. **Verified concurrent-user capacity: unknown; 1,000-user capacity is not established.**

## Required deployment and account actions

1. In Supabase, reset the live administrator and student demo accounts to private, strong credentials or disable the demo accounts after confirming no owner relies on them. Both published credentials were verified active. Do not reuse the public values.
2. Replace Render `JWT_SECRET` with a newly generated Base64 key containing at least 32 random bytes. This invalidates all existing JWT sessions. The prior key appeared in repository history; removing it from the current README does not erase history.
3. Set Render `CORS_ALLOWED_ORIGINS` to the exact deployed Vercel origins. Set the required `JWT_SECRET`, Supabase JDBC URL/user/password, and tune `DB_POOL_SIZE` against the Supabase plan and Render instance count. Do not raise the pool without checking the aggregate ceiling.
4. Deploy the backend Dockerfile changes and confirm the Render service binds to its injected `PORT`; verify the database-aware `/api/health` returns 200.
5. Redeploy Vercel with `VITE_API_BASE_URL=https://placement-prep-platform-2.onrender.com` and the intended public Google client ID. Recheck login, invalid-password 401, registration, refresh/session validation, logout, and protected routes.
6. Add rate limiting and automated integration/security tests before declaring production readiness. Run load tests only against staging with a defined traffic and database budget.

The Supabase dashboard sign-in screen was reached, but no credentials were available to inspect the project. Changing production passwords requires the account owner to complete that action in the dashboard; it was not possible to rotate the active production accounts from this session.
