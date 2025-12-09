# Iron & Clean Pro - Simplified Single App

Your app is now a SINGLE APPLICATION - no more separate frontend/backend!

## Super Quick Start

**Windows:**
```bash
run.bat
```

**Mac/Linux:**
```bash
./run.sh
```

**Or:**
```bash
npm install
npm start
```

Open http://localhost:3001 and login with `tonybisht` / `Topaz26`

## What Changed?

Before: 2 separate apps (frontend on 3000, backend on 3001)
After: 1 combined app (everything on 3001)

- Backend dependencies moved to main package.json
- `npm start` now builds React and starts server
- Server serves both API and static files
- Single port, single process

## Files You Can Delete

These are now redundant:
- `START.bat`
- `START.sh`
- `SIMPLE_START.md`
- `FIX_SERVER.md`
- `test.js` (in server folder)
- `simple-server.js` (in server folder)

## Deploy to Production

See `DEPLOY.md` for detailed deployment instructions.

Quick options:
- Railway: Push to GitHub, click deploy
- Render: Connect GitHub repo
- Heroku: `git push heroku main`

## Even Simpler Option: Supabase

You already have Supabase credentials! I can migrate your app to use Supabase which means:

1. No backend server at all
2. Deploy as static site to Vercel/Netlify (FREE)
3. Even simpler than current setup
4. Supabase handles everything

Want this? Just ask me to "migrate to Supabase"

## Development Mode

```bash
npm run dev
```

Runs frontend (3000) and backend (3001) separately with hot reload for development.

## Troubleshooting

**Error: Cannot find module**
```bash
npm install
```

**Error: build folder not found**
```bash
npm run build
```

**Database connection issues**
- Check server/.env has correct database credentials
- Ensure database allows connections from your IP

## What's Next?

1. Test locally: `npm start`
2. Deploy to Railway/Render (easiest)
3. Or migrate to Supabase for even simpler deployment
