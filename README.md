<div align="center">

# ClassMate

### Everything your class needs, in one place.

A shared workspace for students to organize classes, timetables, homework, subjects, and announcements.

[**Live Demo**](https://classmate-7181.onrender.com/) · [**Source Code**](https://github.com/kathir165/Classmate)

</div>

---

## About

**ClassMate** is a full-stack class-management web app designed to help students and class representatives keep everyday academic information organized in one place. Create a class, invite classmates with a class code, and coordinate schedules and updates together.

## Screenshots

> Screenshots from the deployed app will be added to `docs/screenshots/`. The gallery below lists the main screens captured for this project.

| Login | Dashboard |
|---|---|
| Account login, password recovery, and sign-up entry point. | At-a-glance summary of classes, homework, classmates, timetable, and announcements. |

| Timetable | Homework |
|---|---|
| Weekly schedule with an option to add classes. | Assignment search and filters for all, upcoming, overdue, and completed work. |

| Announcements | Class onboarding |
|---|---|
| A central place to post class updates. | Create a new class or join one using a shared class code. |

## Features

- **Authentication** — sign up, log in, and recover account access.
- **Class spaces** — create a class or join with a class code.
- **Dashboard** — view a quick summary of class activity.
- **Timetable** — organize classes by day and time.
- **Homework tracking** — search assignments and filter by status.
- **Subjects** — keep class subjects organized.
- **Announcements** — share updates with class members.
- **Member management** — view classmates and class membership.
- **Settings and profile** — manage account preferences.
- **Responsive dark UI** — dark surfaces with blue accents.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Authentication | JWT and bcrypt |
| Validation | Zod |

## Project structure

```text
classmate/
├── backend/
│   ├── src/
│   │   ├── db/             # Database schema and connection
│   │   ├── middleware/     # Authentication and authorization
│   │   ├── routes/         # API routes
│   │   └── index.ts        # Express entry point
│   ├── drizzle.config.ts
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/     # Shared UI components
    │   ├── context/        # App state providers
    │   ├── lib/            # API client and shared types
    │   └── pages/          # App pages
    └── .env.example
```

## Getting started

### Prerequisites

- Node.js 20 or later
- A PostgreSQL database
- npm

### 1. Clone the repository

```bash
git clone https://github.com/kathir165/Classmate.git
cd Classmate
```

### 2. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 3. Configure environment variables

Copy each `.env.example` file to `.env` in its respective folder.

In `backend/.env`, configure the database connection and a strong JWT secret. In `frontend/.env`, configure the API URL if your backend is not running at the default address. Never commit real secrets.

### 4. Set up the database

From the `backend` directory, generate and apply migrations:

```bash
npm run db:generate
npm run db:migrate
```

### 5. Run the app locally

Run each command in a separate terminal:

**Terminal 1 — backend**
```bash
cd backend
npm run dev
```

**Terminal 2 — frontend**
```bash
cd frontend
npm run dev
```

Open the local URL printed by Vite in your terminal.

## Production build

Build the backend and frontend from their respective directories:

```bash
npm run build
```

For deployment, configure the production environment variables on your hosting provider and run database migrations against the production database before starting the backend.

## Deployment

The live demo is hosted at [classmate-7181.onrender.com](https://classmate-7181.onrender.com/). Deployment configuration depends on the frontend/backend hosting arrangement and environment variables used by the running service.

## Security

- Passwords are hashed with bcrypt.
- Protected API routes perform server-side authentication and authorization.
- Request data is validated before database operations.
- Secrets belong in environment variables, not source control.

## License

Built as a portfolio/demo project. See the repository for the current license and usage details.

---

<div align="center">

**ClassMate** — helping classmates stay organized, together.

</div>
