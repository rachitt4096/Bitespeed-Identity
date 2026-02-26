# BiteSpeed Backend Task - Identity Reconciliation

Identity reconciliation service for the BiteSpeed backend task, with:
- Express + TypeScript backend (`POST /identify`)
- Prisma + PostgreSQL persistence
- Next.js demo frontend (`http://localhost:3001`)

## Live Endpoint
- `POST https://bitespeed-identity-alpha.vercel.app/identify`

## Requirement Checklist (from PDF)
- [x] Relational SQL database (`PostgreSQL`) with `Contact` table fields required by task
- [x] `POST /identify` endpoint using JSON request body
- [x] Identity reconciliation logic:
  - Create primary contact when no match exists
  - Create secondary contact when new info is introduced
  - Merge clusters by demoting newer primary to secondary
  - Return oldest primary as canonical identity
- [x] Response format includes `contact.primaryContatctId` (task spelling preserved)
- [x] Commit history split into focused commits
- [x] Frontend demo added to visualize endpoint behavior
- [x] Deploy online and replace placeholder live URL above
- [ ] Submit hosted endpoint using BiteSpeed form

## API Contract
### Endpoint
`POST /identify`

### Request Body (JSON)
```json
{
  "email": "doc@example.com",
  "phoneNumber": "123456"
}
```

Accepted input notes:
- At least one of `email` or `phoneNumber` must be present.
- `phoneNumber` is accepted as string or number and normalized internally.

### Response Body (JSON)
```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["doc@example.com", "marty@example.com"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": [23]
  }
}
```

## Local Setup
## 1. Backend
```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Backend runs on `http://localhost:3000` by default.

## 2. Frontend Demo
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Frontend runs on `http://localhost:3001` and calls:
- `NEXT_PUBLIC_API_BASE_URL/identify`

Default value in `.env.local.example` points to local backend:
- `NEXT_PUBLIC_API_BASE_URL=http://localhost:3000`

## Test & Build
```bash
npm run build
npm test
```

## Deploy (Vercel)
This repo is ready for Vercel serverless deployment with:
- `vercel.json` route mapping `/identify` to `api/identify.ts`
- `api/identify.ts` function handler

### Vercel Steps
1. Push this repo to GitHub.
2. In Vercel, import the GitHub repo.
3. Keep root directory as project root (`/`).
4. Set environment variable:
`DATABASE_URL=<your_postgres_connection_string>`
5. Deploy.
6. Verify:
`POST https://<your-vercel-domain>/identify`
7. Replace `Live Endpoint` in this README with deployed URL.

### Build Settings (if asked)
- Install Command: `npm ci`
- Build Command: `npm run vercel-build`
- Output Directory: leave empty

## Alternative Deploy (Render)
`render.yaml` is also included if you prefer Render.

## Quick curl Check
```bash
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"email":"doc@example.com","phoneNumber":"123456"}'
```

## Submission Notes
- Use JSON body (not form-data).
- Include your deployed endpoint in this README.
- Submit through the BiteSpeed form linked in the task PDF.
