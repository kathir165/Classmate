# ClassMate

<div align="center">

### Everything your class needs, in one place.

A shared workspace for students and class representatives to manage classes, timetables, homework, subjects, and announcements.

[**Live Demo**](https://classmate-7181.onrender.com/) · [**GitHub Repository**](https://github.com/kathir165/Classmate)

</div>

---

## About

**ClassMate** is a full-stack class-management web app built to keep everyday academic information organized in one place. Students can create a class, invite classmates using a class code, and coordinate schedules and updates together.

## Screenshots

The deployed app uses a dark interface with blue highlights. The screenshots supplied for this refresh cover the following screens:

| Login | Onboarding |
|---|---|
| Account login and sign-up entry point. | Create a class or join one using a shared class code. |

| Dashboard | Timetable |
|---|---|
| Overview of classes today, pending homework, announcements, and classmates. | Weekly schedule with an option to add classes. |

| Homework | Announcements |
|---|---|
| Search assignments and filter by all, upcoming, overdue, or completed. | A central place to post updates for class members. |

> **To render the screenshots in this gallery:** add the provided image files to `docs/screenshots/` in the repository, then replace each description above with a Markdown image link such as `![Dashboard](docs/screenshots/dashboard.png)`. The screenshot files themselves are not yet committed to the repository.

## Features

- **Authentication** — sign-up, login, and password recovery entry point.
- **Class spaces** — create a class or join with a class code.
- **Dashboard** — see a summary of class activity.
- **Timetable** — organize classes by day and time.
- **Homework tracking** — search assignments and filter by status.
- **Subjects** — keep class subjects organized.
- **Announcements** — share updates with classmates.
- **Member management** — view class members.
- **Profile and settings** — access account settings.
- **Dark UI** — dark surfaces, clear navigation, and blue accents.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Authentication | JWT and bcrypt |
| Validation | Zod |

## Project Structure

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
    │   └── pages/          # Application pages
    └── .env.example
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- A PostgreSQL database

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

- In `backend/.env`, configure `DATABASE_URL` and a strong `JWT_SECRET`.
- In `frontend/.env`, configure the API URL if the backend is not running at its default address.

Never commit real credentials or secrets. Generate a strong JWT secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 4. Run database migrations

From the `backend` directory:

```bash
npm run db:generate
npm run db:migrate
```

### 5. Start the development servers

Run these in separate terminals.

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

## Production Build

Run `npm run build` from each project directory. Configure production environment variables with your hosting provider and apply database migrations before starting the backend.

## Live Demo

Try ClassMate: **[https://classmate-7181.onrender.com/](https://classmate-7181.onrender.com/)**

## Security Notes

- Passwords are hashed with bcrypt rather than stored as plaintext.
- Protected API routes should enforce authentication and authorization on the server.
- Validate incoming data before database operations.
- Keep secrets in environment variables and out of source control.

## License

Built as a portfolio/demo project. See the repository for the current license and usage details.

---

<div align="center">

**ClassMate** — helping classmates stay organized, together.

</div>
