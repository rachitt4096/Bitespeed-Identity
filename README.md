# BiteSpeed Identity Reconciliation

Backend API and Next.js demo frontend for the `/identify` endpoint.

## Backend

```bash
npm install
npm run dev
```

API runs on `http://localhost:3000`.

## Frontend (Next.js demo)

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Frontend runs on `http://localhost:3001` and calls `NEXT_PUBLIC_API_BASE_URL`.

You can also run frontend scripts from project root:

```bash
npm run dev:frontend
npm run build:frontend
npm run start:frontend
```
