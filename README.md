# ClassMate

**Everything your class needs, in one place.**

ClassMate is a full-stack workspace for college students and class representatives to manage timetables, subjects, homework, announcements, and classmates in one shared, always-up-to-date place.

---

## Stack

| Layer     | Technology                                  |
|-----------|----------------------------------------------|
| Frontend  | React + TypeScript + Vite + Tailwind CSS      |
| Backend   | Node.js + Express + TypeScript                |
| Database  | PostgreSQL                                    |
| ORM       | Drizzle ORM                                   |
| Auth      | Self-hosted JWT + bcrypt (see note below)     |

> **A note on authentication:** the brief asked for Clerk or an equivalent secure, production-ready provider. This project ships with a self-hosted equivalent — bcrypt password hashing (cost factor 12) and signed JWTs — because it can be fully implemented and reviewed without a live third-party API key. It's a legitimate production pattern, not a stub: no plaintext passwords, no hardcoded users, sessions are verified server-side on every request, and role checks happen in middleware, not in the UI. If you'd rather use Clerk, swap `backend/src/middleware/auth.ts` and `backend/src/routes/auth.ts` for Clerk's Node SDK and their frontend hooks — the rest of the app (routes, permission checks, schema) doesn't need to change.

---

## Project structure

```
classmate/
├── backend/
│   ├── src/
│   │   ├── db/            # Drizzle schema, connection, migrations runner
│   │   ├── middleware/     # auth, class-membership/role checks, error handler
│   │   ├── routes/         # auth, users, classes, members, subjects, timetable, homework, announcements
│   │   └── index.ts        # Express app entry point
│   ├── drizzle.config.ts
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/     # AppShell, Avatar, badges, empty/loading states, modals
    │   ├── context/         # Auth, Class, Toast providers
    │   ├── lib/              # API client, shared types
    │   └── pages/            # Landing, auth, onboarding, dashboard, timetable, subjects, homework, announcements, members, profile, settings
    └── .env.example
```

---

## Database schema

Normalized PostgreSQL schema (see `backend/src/db/schema.ts` for the full definition):

- **users** — account info, hashed password, avatar color
- **classes** — name, description, unique join `code`, creator
- **class_members** — join table (userId, classId, role), unique constraint prevents duplicate membership
- **subjects** — belongs to a class
- **timetable_entries** — belongs to a class + subject, day of week, start/end time, room
- **homework** — belongs to a class, optional subject, due date, status
- **announcements** — belongs to a class, priority, message

All foreign keys cascade appropriately, all lookup columns are indexed, and `class_members` has a unique index on `(classId, userId)` to prevent duplicate joins.

---

## Local setup

### Prerequisites
- Node.js 20+
- A PostgreSQL database (local install, Docker, or a hosted service like Neon, Supabase, or Railway)

### 1. Clone and install

```bash
git clone <your-repo-url> classmate
cd classmate/backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment variables

```bash
cd backend
cp .env.example .env
# Fill in DATABASE_URL and JWT_SECRET

cd ../frontend
cp .env.example .env
# Defaults to http://localhost:4000/api, adjust if needed
```

Generate a strong `JWT_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 3. Run database migrations

```bash
cd backend
npm run db:generate   # generates SQL migration files from the schema
npm run db:migrate    # applies them to your database
```

### 4. Start development servers

In two terminals:

```bash
# Terminal 1
cd backend && npm run dev     # http://localhost:4000

# Terminal 2
cd frontend && npm run dev    # http://localhost:5173
```

Visit `http://localhost:5173`. Create an account, create or join a class, and you're in.

### Verifying multi-user behavior locally

Open two browser sessions (e.g. one normal, one incognito), sign up as two different users, have the first create a class and share the generated code, and have the second join with that code. Announcements, homework, and timetable changes made by either user should appear for the other after a refresh — all data lives in Postgres, not in browser storage.

---

## Production build

```bash
# Backend
cd backend
npm run build      # compiles TypeScript to dist/
npm start           # runs dist/index.js

# Frontend
cd frontend
npm run build       # outputs static assets to dist/
npm run preview     # locally preview the production build
```

---

## Deployment

- **Frontend** — deploy the `frontend/dist` output to any static host (Vercel, Netlify, Cloudflare Pages). Set `VITE_API_URL` to your deployed backend's URL at build time.
- **Backend** — deploy `backend/` to any Node host (Render, Railway, Fly.io, a VPS). Set `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN` (pointing at your frontend's deployed URL), and `PORT` as environment variables in the host's dashboard — never commit them.
- **Database** — use a managed PostgreSQL instance (Neon, Supabase, Railway, RDS). Run `npm run db:migrate` against the production `DATABASE_URL` once before first boot.

---

## Security notes

- Passwords are hashed with bcrypt (cost factor 12) — never stored or logged in plaintext.
- Every class-scoped API route verifies the requester is a member of that class server-side (`requireClassMembership`), and admin-only actions verify the `admin` role server-side (`requireClassAdmin`) — the frontend hiding a button is never the only protection.
- All inputs are validated with Zod before touching the database.
- `.env` files are gitignored; only `.env.example` files (with no real secrets) are committed.
- CORS is restricted to the configured frontend origin.

---

## License

Built as a portfolio/demo project. Use and modify freely.
