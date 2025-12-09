# Deployment Guide - Iron & Clean Pro

Your app is now a SINGLE APPLICATION that's simple to deploy!

## Local Testing

```bash
npm install
npm start
```

Open http://localhost:3001

Login: `tonybisht` / `Topaz26`

## How It Works

1. `npm start` builds the React app and starts the Node.js server
2. Everything runs on ONE port (3001)
3. Server serves both API (at /api/*) and the React app (at /*)
4. Single process, simple deployment

## Deploy to Any Platform

### Railway (Easiest)

1. Push code to GitHub
2. Create Railway account
3. Click "New Project" -> "Deploy from GitHub"
4. Add environment variables (see below)
5. Done! Railway auto-detects Node.js and runs `npm start`

### Render.com

1. Push code to GitHub
2. Create new "Web Service"
3. Build command: `npm install && npm run build`
4. Start command: `node server/server.js`
5. Add environment variables

### Heroku

1. Install Heroku CLI
2. `heroku create your-app-name`
3. `heroku config:set DB_HOST=... DB_PASSWORD=...` (see variables below)
4. `git push heroku main`

## Required Environment Variables

Set these in your hosting platform:

```
DB_HOST=132.226.215.254
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=6ccQll56TmCaSwefKBduVQyIuYmBoTEkrMh6sfQkWnaYVy4omHP4WfyBzAJt1Qu8
DB_NAME=postgres
JWT_SECRET=your-random-secret-change-this
PORT=3001
```

## Even Simpler: Supabase Migration

Want NO backend server at all?

You already have Supabase credentials in your .env file! I can convert your app to use Supabase which means:

- No Node.js server needed
- Deploy to Vercel/Netlify as static site (FREE)
- Supabase handles database, auth, APIs automatically
- Even simpler than current setup

Just say "migrate to Supabase" and I'll do it in 5 minutes!

## Troubleshooting

**Database connection error?**
- Make sure your database allows connections from your hosting IP
- Check DB_HOST and DB_PASSWORD are set correctly

**Port already in use?**
- Change PORT environment variable to 3002 or 8080

**Build fails?**
- Run `npm install` first
- Make sure you're using Node.js 14 or higher
