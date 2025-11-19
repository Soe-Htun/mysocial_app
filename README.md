# SocialSphere

A Facebook-inspired social network built with a modern React + Tailwind frontend and a Node.js/Express API powered by Prisma + MySQL.

## Tech stack
- **Frontend:** React 19, Vite, React Router, Zustand state, Tailwind CSS, Lucide icons
- **Backend:** Express 5, Prisma ORM, MySQL, JWT auth, Zod validation
- **Tooling:** Nodemon for local dev, seed script for demo data

## Project structure
```
frontend/  # React client
backend/   # Express API + Prisma schema
```

## Getting started
1. **Clone dependencies**
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```

2. **Configure environment**
   - Backend: copy `backend/.env` and set your MySQL connection + `JWT_SECRET`. Default assumes `mysql://mysocial_user:StrongPass123@localhost:3306/mysocial_app`.
   - Frontend (optional): create `frontend/.env` when pointing to a non-default API host.
     ```bash
     VITE_API_URL=http://localhost:4000/api
     ```

3. **Database setup**
   ```bash
   cd backend
   npx prisma migrate dev --name init   # creates schema
   node src/seed.js                     # loads demo users/posts
   ```

4. **Run servers**
   ```bash
   # backend
   cd backend
   npm run dev

   # frontend (new terminal)
   cd frontend
   npm run dev
   ```

5. **Demo login** (after seeding): `demo@social.app / password123`

## Available scripts
### Frontend
- `npm run dev` – Vite dev server
- `npm run build` – production build
- `npm run preview` – preview production build

### Backend
- `npm run dev` – nodemon server with auto reload
- `npm run start` – production server
- `npm run prisma:migrate` – run Prisma migrations
- `npm run prisma:generate` – regenerate Prisma client
- `npm run prisma:studio` – open Prisma data browser

## API surface
- `POST /api/auth/register` – create user account
- `POST /api/auth/login` – issue JWT + httpOnly cookie
- `POST /api/auth/logout` – clear session
- `GET /api/posts` – feed with authors, comments, reactions
- `POST /api/posts` – create post (auth)
- `POST /api/posts/:id/comments` – add comment (auth)
- `POST /api/posts/:id/reactions` – toggle like/celebrate (auth)
- `GET /api/notifications` – list notifications (auth)
- `POST /api/notifications/:id/read` – mark read (auth)
- `GET /api/messages` – inbox threads (auth)
- `POST /api/messages` – send message (auth)

Auth-protected endpoints accept `Authorization: Bearer <token>` and also set/read the `token` httpOnly cookie for browser sessions.

## Notes
- The frontend gracefully falls back to demo data if the API is offline, so you can still explore the UI.
- Tailwind and component structure favor reusability; extend `useSocialStore` if you add new features.
- Prisma schema models map directly to social concepts (users, posts, comments, reactions, notifications, messages) making it easy to evolve the product.
