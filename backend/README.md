# Edu-AI Node Backend

Node.js + Express + MongoDB (Mongoose) backend for syllabus and learning APIs.

## Setup

1) Copy `.env.example` to `.env` and edit values.
2) Install dependencies: `npm install`
3) Seed data (optional): `npm run seed`
4) Start server: `npm run start`

## AI Providers

Set these in `.env`:

- `GEMINI_API_KEY` (primary)
- `GEMINI_MODEL` (default: `gemini-1.5-flash`)
- `GROQ_API_KEY` (fallback)
- `GROQ_MODEL` (default: `llama-3.3-70b-versatile`)
- `YOUTUBE_API_KEY` (required for in-app sign video search; results are limited to the ISLRTC channel)
- `PORT` (backend port; use `5000` to match the frontend's default API URL)

## Endpoints

- `GET /boards`
- `GET /classes`
- `GET /subjects?class=6&board=NCERT`
- `GET /chapters?class=6&subject=Science&board=NCERT&page=1&limit=20`
- `GET /topics?chapter_id=<id>`
- `GET /search?q=keyword`
- `GET /next-chapter?class=6&subject=Maths&current=3&board=NCERT`
- `GET /learning-path?class=6&subject=Maths&board=NCERT`
- `POST /user/login`
- `POST /user/progress`
- `GET /user/progress`

## Notes

- Syllabus seed reads from `../backend/data/syllabus/ncert_syllabus.json`.
- API uses JWT for lightweight auth in user endpoints.
- Configured user data isolation and settings navigation consistency.
