# ClassMate

<div align="center">

# ClassMate

### Everything your class needs, in one place.

A student-focused class management platform to bring timetables, homework, subjects, and class announcements together in one workspace.

<p>
  <a href="https://classmate-7181.onrender.com/"><strong>🚀 Live Demo</strong></a>
  &nbsp;·&nbsp;
  <a href="https://github.com/kathir165/Classmate"><strong>📦 Source Code</strong></a>
</p>

![Project status](https://img.shields.io/badge/status-live-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Frontend](https://img.shields.io/badge/frontend-React-61DAFB?logo=react&logoColor=black)
![Backend](https://img.shields.io/badge/backend-Node.js-339933?logo=nodedotjs&logoColor=white)

</div>

---

## Preview

**Try the deployed application:** [classmate-7181.onrender.com](https://classmate-7181.onrender.com/)

<p align="center">
  <a href="https://classmate-7181.onrender.com/">
    <img src="https://s.wordpress.com/mshots/v1/https%3A%2F%2Fclassmate-7181.onrender.com/?w=1200" alt="Live preview of the ClassMate application" width="90%">
  </a>
</p>

> For the full gallery of individual screens, add the original screenshots to `docs/screenshots/` using the filenames listed below. Those individual image files are not currently present in the repository, so they cannot be embedded reliably yet.

## Screenshots

| Login and sign-up | Onboarding |
|---|---|
| ![Login screenshot](docs/screenshots/login.png) | ![Onboarding screenshot](docs/screenshots/onboarding.png) |

| Dashboard | Timetable |
|---|---|
| ![Dashboard screenshot](docs/screenshots/dashboard.png) | ![Timetable screenshot](docs/screenshots/timetable.png) |

| Homework | Announcements |
|---|---|
| ![Homework screenshot](docs/screenshots/homework.png) | ![Announcements screenshot](docs/screenshots/announcements.png) |

## About

ClassMate is a full-stack class-management web app designed to make everyday academic coordination simpler. Students can create a class, invite classmates with a class code, and keep important class information organized in one place.

## Features

- **Authentication** — account registration, login, and password recovery entry point.
- **Class spaces** — create a class or join an existing class using a shared code.
- **Dashboard** — get an overview of class activity and upcoming work.
- **Timetable** — organize classes by day and time.
- **Homework tracking** — search assignments and filter by status.
- **Subjects** — keep class subjects organized.
- **Announcements** — share updates with classmates.
- **Member management** — view class members and class participation.
- **Profile and settings** — access account preferences.
- **Responsive dark interface** — clear navigation with blue accents.

## Tech Stack

<div align="center">

### Frontend

<a href="https://react.dev/"><img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" alt="React"></a>
<a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript"></a>
<a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white" alt="Vite"></a>
<a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS"></a>

### Backend and data

<a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-20%2B-339933?logo=nodedotjs&logoColor=white" alt="Node.js"></a>
<a href="https://expressjs.com/"><img src="https://img.shields.io/badge/Express.js-4-000000?logo=express&logoColor=white" alt="Express"></a>
<a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL"></a>
<a href="https://orm.drizzle.team/"><img src="https://img.shields.io/badge/Drizzle_ORM-TypeScript-C5F74F?logo=drizzle&logoColor=black" alt="Drizzle ORM"></a>
<a href="https://zod.dev/"><img src="https://img.shields.io/badge/Zod-Validation-3E67B1?logo=zod&logoColor=white" alt="Zod"></a>

### Deployment and services

<a href="https://render.com/"><img src="https://img.shields.io/badge/Render-Deployment-46E3B7?logo=render&logoColor=black" alt="Render"></a>
<a href="https://supabase.com/"><img src="https://img.shields.io/badge/Supabase-PostgreSQL_platform-3FCF8E?logo=supabase&logoColor=white" alt="Supabase"></a>

</div>

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Authentication | JWT and bcrypt |
| Validation | Zod |
| Hosting | Render |

## Project Structure

```text
Classmate/
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
    │   ├── context/        # Application state providers
    │   ├── lib/            # API client and shared types
    │   └── pages/          # Application pages
    └── .env.example
```

## Run Locally

### Prerequisites

- Node.js 20 or newer
- npm
- A PostgreSQL database (local or hosted)

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

Copy each `.env.example` file to `.env` in its corresponding folder.

- In `backend/.env`, set `DATABASE_URL` and a strong `JWT_SECRET`.
- In `frontend/.env`, set `VITE_API_URL` if the API is not running at its default URL.

Generate a secure JWT secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

**Keep credentials and secrets out of Git.** Commit only the example environment files.

### 4. Apply database migrations

From the `backend` directory:

```bash
npm run db:generate
npm run db:migrate
```

### 5. Start the development servers

Run each command in a separate terminal.

**Backend**

```bash
cd backend
npm run dev
```

**Frontend**

```bash
cd frontend
npm run dev
```

Open the local URL printed by Vite.

## Deployment

The current live demo is hosted at [Render](https://classmate-7181.onrender.com/). For another deployment, configure the frontend API URL, backend environment variables, CORS origin, and PostgreSQL connection string in the relevant hosting dashboards. Apply database migrations before starting the production backend.

## Security Notes

- Passwords are hashed with bcrypt rather than stored as plaintext.
- Protected API routes should enforce authentication and authorization on the server.
- Validate incoming data before database operations.
- Store credentials in environment variables and never commit real secrets.

## License

ClassMate is licensed under the [MIT License](LICENSE). You may use, copy, modify, distribute, and sublicense the project, subject to the license's conditions.

---

<div align="center">

**ClassMate** — helping classmates stay organized, together.

Made with ❤️ for students.

</div>
