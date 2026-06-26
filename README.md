# Smart School Manager

Smart School Manager is a full-stack school management system for nursery, primary, and secondary schools. It uses Node.js, Express.js, MySQL, Sequelize, React, Vite, Tailwind CSS, JWT authentication, bcrypt password hashing, Recharts analytics, and PDF report card generation.

## Quick Start

```bash
npm run install:all
copy backend\.env.example backend\.env
npm run db:sync
npm run db:seed
npm run build
npm start
```

The backend serves the React production build from `frontend/dist`, so one Hostinger Node.js app can run the API and frontend together.

## Demo Accounts

All seeded users use password `Password123!`.

| Role | Email |
| --- | --- |
| Admin | admin@smartschool.test |
| Teacher | grace.teacher@smartschool.test |
| Teacher | david.teacher@smartschool.test |
| Teacher | zainab.teacher@smartschool.test |
| Student | ada.student@smartschool.test |
| Parent | chinedu.parent@smartschool.test |

## Environment Variables

Create `backend/.env` from `backend/.env.example` and update the values for your MySQL database.

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=smart_school_manager
DB_PORT=3306
JWT_SECRET=replace-with-a-long-random-secret
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

## Local Development

```bash
npm run install:all
copy backend\.env.example backend\.env
npm run db:sync
npm run db:seed
npm run dev
```

The frontend runs on Vite and calls `/api` in production or `VITE_API_URL` in development.

## Hostinger Node.js Deployment

1. Create a MySQL database in Hostinger and note the database host, username, password, database name, and port.
2. Upload this project to your Hostinger Node.js app directory.
3. In Hostinger, set the Node.js application root to the project folder.
4. Set the startup file to `server.js`. This root startup file launches `backend/server.js` and serves the built React frontend from `frontend/dist`.
5. Set environment variables in the Hostinger Node.js panel:
   - `DB_HOST`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `DB_PORT`
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - `PORT`
   - `CORS_ORIGIN=https://your-domain.com`
6. Install backend dependencies in `backend`.
7. Build the frontend before or after upload:

```bash
npm --prefix frontend install
npm --prefix frontend run build
```

8. Run database setup once:

```bash
npm --prefix backend run db:sync
npm --prefix backend run db:seed
```

9. Restart the Hostinger Node.js app.

Express serves `frontend/dist` automatically in production, while all API routes remain under `/api`.

## Database

The app uses Sequelize models with foreign keys and indexes. `npm run db:sync` creates the schema, and `npm run db:seed` inserts realistic sample data. A readable SQL schema is also provided at `backend/config/schema.sql`.

## Main Features

- JWT authentication with bcrypt password hashing
- Admin, Teacher, Student, and Parent dashboards
- Role-based backend and frontend access control
- Student, parent, teacher, class, subject, and teacher assignment management
- Attendance marking and update workflows
- Grade entry with calculated totals and grade bands
- Assignment creation and submission tracking
- Announcements and calendar events with role visibility
- Analytics dashboards with charts
- Student and parent report card PDF downloads
