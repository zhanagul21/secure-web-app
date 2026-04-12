# Deployment Notes

## Goal

Make the local project work as a public application without breaking the current local setup.

Frontend:

- Public URL: `https://secure-web-app-teal.vercel.app`
- Hosted on Vercel.

Backend:

- Must be deployed separately as a Node.js API service.
- The Vercel frontend must call the public backend URL, not `http://localhost:5000`.

Recommended backend host for this setup:

- Render Web Service using `render.yaml` from the repository root.

## Required Environment Variables

### Frontend on Vercel

Set this in Vercel project settings:

```txt
VITE_API_BASE_URL=https://YOUR_BACKEND_PUBLIC_URL/api
```

Do not use this in production:

```txt
VITE_API_BASE_URL=http://localhost:5000/api
```

`localhost` works only on your own computer.

### Backend Hosting

Set these variables on the backend host:

```txt
PORT=5000
DB_USER=...
DB_PASSWORD=...
DB_SERVER=...
DB_NAME=...
DB_PORT=1433
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=false
JWT_SECRET=...
GMAIL_USER=...
GMAIL_APP_PASSWORD=...
ENCRYPTION_KEY=...
FRONTEND_URL=http://localhost:5173,https://secure-web-app-teal.vercel.app
UPLOADS_DIR=./uploads
```

`FRONTEND_URL` supports multiple origins separated by commas. This keeps local development and the public Vercel site working at the same time.

## Important Notes

- If the database is only on your local computer, the public backend cannot connect to it.
- For public deployment, use a database that the backend host can reach, for example Azure SQL, a remote MSSQL server, or a database service with network access enabled.
- Uploaded files must be stored somewhere persistent. If the backend host deletes local files on restart, use persistent disk storage or cloud object storage.
- Never commit `.env` secrets to GitHub.

## Safe Deployment Order

1. Keep local `.env` unchanged so local development continues working.
2. Push the repository without committing real `.env`, `node_modules`, `uploads`, or `temp` files.
3. Deploy backend first.
4. Add backend environment variables on the hosting provider.
5. Open backend `/api/health` and confirm it returns `{ "ok": true }`.
6. Set Vercel `VITE_API_BASE_URL` to the backend public URL plus `/api`.
7. Redeploy Vercel frontend.
8. Test register, login, upload, preview, download, and shared link.

## Render Backend Setup

If using Render:

1. Create a new Blueprint or Web Service from this repository.
2. Use the root `render.yaml` file.
3. Confirm the service root directory is `backend`.
4. Build command: `npm ci`.
5. Start command: `npm start`.
6. Add all secret environment variables in Render.
7. After deployment, copy the backend URL, for example:

```txt
https://secure-web-app-backend.onrender.com
```

Then set Vercel frontend variable:

```txt
VITE_API_BASE_URL=https://secure-web-app-backend.onrender.com/api
```

## Encryption Check

After uploading a new document locally, run:

```powershell
cd C:\secure-web-app\backend
node scripts\check-upload-encryption.js
```

New files should show:

```json
{
  "encrypted": true
}
```
