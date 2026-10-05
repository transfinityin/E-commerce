# Transfinity cheap deploy (no Hostinger)

## Architecture
- Frontend: Vercel (Vite) — this `frontend/` folder
- Backend: Render Web Service — `backend/` (Procfile + build.sh)
- Database: Neon Postgres (free tier to start)

## 1) Neon
1. Create project at https://console.neon.tech
2. Copy the **pooled** connection string
3. In Render → backend env → set `DATABASE_URL=<neon-url>`
4. Deploy runs `build.sh` which migrates

## 2) Render (Django)
- Root directory: `backend`
- Build: `./build.sh` (or `bash build.sh`)
- Start: `gunicorn backend.wsgi:application`
- Env vars from `.env.example` + secrets (Cloudinary, Razorpay, Google, Email)
- Set `DEBUG=False`, `FRONTEND_URL=https://YOUR.vercel.app`, `BACKEND_URL=https://YOUR.onrender.com`
- `ALLOWED_HOSTS` must include your Render hostname

## 3) Vercel (Vite)
- Root: `frontend`
- Build: `npm run build`
- Output: `dist`
- Env: `VITE_API_URL=https://YOUR.onrender.com/api`
- `vercel.json` SPA rewrites already present

## 4) Local (current)
```bash
export DOCKER_HOST=unix:///var/run/docker.sock
cd /home/gotoz/Documents/Transfinity
docker compose up -d db backend
cd frontend && VITE_API_URL=http://localhost:8000/api npm run dev -- --port 5173
```
- API: http://localhost:8000
- Shop UI (new theme home): http://localhost:5173
- Marketing reference (Next): http://localhost:10001 — design source only

## Admin seed (local)
- email: `admin@transfinity.test`
- password: `Admin123!`
