# Single-App Startup Guide

Your app is now a single combined application!

## Quick Start (Production Mode)

```bash
npm install
npm start
```

That's it! The app will:
1. Build the React frontend
2. Start the Node.js server
3. Serve everything on http://localhost:3001

## Development Mode (with hot reload)

```bash
npm install
npm run dev
```

This runs frontend (port 3000) and backend (port 3001) separately for development.

## What Changed

- Backend dependencies are now in the main package.json
- `npm start` builds React and starts the combined server
- Server serves both the API and the static React files
- Everything runs on ONE port (3001) in production

## Deploy Anywhere

Since it's a single Node.js app, you can deploy to:
- Heroku
- Railway
- Render
- DigitalOcean
- Any Node.js host

Just set your database environment variables and run `npm start`

## Environment Variables for Deployment

Set these on your hosting platform:
```
DB_HOST=your-database-host
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your-password
DB_NAME=postgres
JWT_SECRET=change-this-to-random-string
PORT=3001
```

## Even Simpler: Supabase Option

Want to eliminate the backend entirely? You already have Supabase credentials!

I can convert your app to use Supabase, which means:
- No backend server needed
- Deploy as static site to Vercel/Netlify (free)
- Just frontend code
- Supabase handles database, auth, APIs

Let me know if you want this even simpler option!
