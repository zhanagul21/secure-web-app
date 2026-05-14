# AuthGuard Locker Security Summary

## Diploma Topic

Current authentication and encryption methods for a protected web application.

## Implemented Controls

- Email verification code for registration.
- JWT-protected API routes.
- Access token plus refresh token session model.
- Logout token blacklist so signed-out access tokens stop working.
- TOTP two-factor authentication with QR setup.
- bcrypt password hashing.
- AES-256-GCM document encryption before storage.
- Encryption proof endpoint shows the stored `AGENC1:` marker, ciphertext SHA-256 hash, IV, and auth tag metadata.
- Role-based access control with `user` and `admin` roles.
- Admin panel for user, role, and 2FA management.
- Activity logging for account, security, and document actions.
- IP address and user-agent context in authentication audit logs.
- Temporary expiring shared document links.
- Helmet security headers and CORS allowlist.
- Rate limiting on login, code, registration, and password reset endpoints.
- Input validation for email, OTP code, and password strength.
- Password strength indicator in the frontend.
- Backend file upload validation by extension, MIME type, and file signature.
- Production HTTPS through Vercel and Render.
- Frontend security headers through Vercel CSP, `nosniff`, referrer policy, and permissions policy.

## Algorithms To Explain

- bcrypt for one-way password hashing.
- JWT for stateless access authorization.
- TOTP for time-based two-factor authentication.
- AES-256-GCM for authenticated symmetric encryption.
- SHA-256 for token hashing and ciphertext fingerprint display.

## Security Testing Checklist

- Brute-force login attempts are blocked by rate limiting.
- Invalid email and weak passwords are rejected before controller logic.
- Wrong 2FA codes are logged.
- Uploaded files with mismatched extension and file signature are rejected.
- Non-admin users cannot access admin endpoints.
- Expired shared links stop working.
- Logout invalidates refresh tokens and blacklists the current access token.
- Document viewer shows encryption proof without exposing plaintext storage.
