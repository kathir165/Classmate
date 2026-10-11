# ClassMate

<div align="center">

### Everything your class needs, in one place.

A student-focused class management platform to bring timetables, homework, subjects, and class announcements together in one workspace.

<p>
  <a href="https://classmate-7181.onrender.com/"><strong>🚀 Live Demo</strong></a>
  &nbsp;·&nbsp;
  <a href="https://github.com/kathir165/Classmate"><strong>📦 Source Code</strong></a>
</p>

![Project status](https://img.shields.io/badge/status-live-brightgreen)
![License](https://img.shields.io/badge/license-All%20Rights%20Reserved-red)
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

### Application Screenshots

<p align="center">
  <img src="docs/screenshots/login.png" alt="ClassMate login screen" width="48%">
  <img src="docs/screenshots/onboarding.png" alt="ClassMate onboarding screen" width="48%">
</p>
<p align="center"><em>Login and onboarding</em></p>

<p align="center">
  <img src="docs/screenshots/dashboard.png" alt="ClassMate dashboard" width="90%">
</p>
<p align="center"><em>Dashboard</em></p>

<p align="center">
  <img src="docs/screenshots/timetable.png" alt="ClassMate timetable" width="48%">
  <img src="docs/screenshots/homework.png" alt="ClassMate homework tracker" width="48%">
</p>
<p align="center"><em>Timetable and homework</em></p>

<p align="center">
  <img src="docs/screenshots/announcements.png" alt="ClassMate announcements" width="90%">
</p>
<p align="center"><em>Class announcements</em></p>

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
<a href="https://expressjs.com/"><img src="https://img.shields.io/badge/Express.js-4-000000?logo=express" alt="Express"></a>
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

## License and Copyright

Copyright © 2026 Kathirselvan T. All rights reserved.

This repository is public for viewing purposes only. No license or permission is granted to use, copy, modify, distribute, publish, or commercially exploit this code without prior written permission from the copyright holder. See [LICENSE](LICENSE) for the full notice.

---

<div align="center">

**ClassMate** — helping classmates stay organized, together.

</div>
