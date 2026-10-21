# RAG Workspace Frontend
Modern React + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui-style components.

## Run
npm install
cp .env.example .env
npm run dev

## Backend contract
Update `src/api.ts` and `src/types.ts` if your existing RAG API differs.

Expected endpoints:
POST /auth/login
POST /chat
GET /documents
POST /documents/upload
DELETE /documents/:id
GET /sources
GET /collections

The UI includes Login, Chat, Documents, Sources and Settings, plus a responsive sidebar, dark mode, retrieval controls, source citations, upload/search/delete flows and a typed service boundary.

For production, add SSE/fetch streaming for chat, pagination, conversation history, cancellation, error boundaries and tests.
