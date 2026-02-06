# Issue Tracker (Express + MySQL + React)

Full-stack issue tracker with JWT auth, CRUD, filtering, export, and polished UI.

## Tech

- Backend: Express, TypeScript, Prisma, MySQL, JWT, Zod, Helmet
- Frontend: React + Vite + TypeScript, Redux Toolkit + RTK Query, React Router
- Styling: custom theme (Space Grotesk), responsive layout

## Features

- Secure auth (register/login, hashed passwords, JWT)
- Issue CRUD with status transitions (Open, In Progress, Resolved, Closed)
- Filters + debounced search + pagination
- Status and priority badges, severity, assignee, labels
- Per-status counts, detail view, resolve/close confirmations
- Export list to CSV or JSON

## Running locally

1. Start MySQL (Docker):

```sh
cd "g:/JS React/Issue Tracker"
docker compose up -d
```

2. Backend setup:

```sh
cd server
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run dev
```

3. Frontend setup:

```sh
cd ../client
cp .env.example .env
npm install
npm run dev
```

Frontend: http://localhost:5173, API: http://localhost:4000. Adminer: http://localhost:9090 (server: db, user: root, password: root, database: issuetracker).

## API quick reference

- POST /auth/register { email, password, name }
- POST /auth/login { email, password }
- GET /auth/me
- GET /issues?search=&status=&priority=&page=&pageSize=
- GET /issues/:id
- POST /issues
- PATCH /issues/:id
- PATCH /issues/:id/status { status }
- DELETE /issues/:id
- GET /issues/export?format=csv|json

## Testing with demo credentials

Use email `demo@team.io` and password `password123` after registering once.

## Notes

- JWT is stored in localStorage for demo simplicity.
- Adjust `VITE_API_URL` if the API runs on a different host/port.
- If you prefer a local MySQL instead of Docker, create a database named `issuetracker`, set `DATABASE_URL` in `server/.env` (e.g., `mysql://root:root@localhost:3306/issuetracker`), then run `npx prisma migrate dev --name init`.
- Linting: `npm run lint` inside server.
