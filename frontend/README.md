# Secure Web Application

## Takyrip

Kazakh: Kazirgi autentifikatsiya zhane shifrlau adisterin paidalana otyryp, korgalgan web-kosymshany azirleu.

Russian: Razrabotka zashchishchennogo web-prilozheniya s ispolzovaniem sovremennyh metodov autentifikatsii i shifrovaniya.

English: Developing a secure web application using current authentication and encryption methods.

## Project Goal

This web application protects user accounts and stores documents securely. The system uses email verification, JWT authorization, two-factor authentication, AES-256-GCM file encryption, and automatic decryption when a user previews, downloads, or opens a shared document.

## Main Features

- Email registration and verification code.
- JWT-protected API routes.
- Two-factor authentication.
- Encrypted document storage on the server.
- Automatic decryption for preview, download, and shared links.
- Activity logging for account and document actions.
- Temporary shared links for documents.

## Technologies

- Frontend: React, Vite, Tailwind CSS, Axios.
- Backend: Node.js, Express, MSSQL.
- Authentication: JWT, email verification, 2FA.
- Encryption: AES-256-GCM.

## Run

Backend:

```bash
cd ../backend
npm install
npm run dev
```

Frontend:

```bash
npm install
npm run dev
```
