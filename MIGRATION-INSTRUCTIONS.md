# Migration Instructions: Supabase to Coolify PostgreSQL

## Overview
This guide will help you migrate your application from Supabase to your self-hosted PostgreSQL database on Coolify.

## Important Notes

⚠️ **Authentication Challenge**: Your application currently uses Supabase Auth which is tightly integrated with Supabase. You have two options:

### Option 1: Keep Supabase for Auth Only (Recommended for Quick Migration)
- Keep using Supabase for authentication (`auth.users`, `auth.uid()`)
- Move only data tables to your PostgreSQL database
- Requires minimal code changes

### Option 2: Full Migration with Custom Auth
- Completely remove Supabase dependency
- Implement custom authentication (JWT, sessions, etc.)
- Requires significant code changes to replace `auth.uid()` references

## Step 1: Run the Migration Script on Your Coolify PostgreSQL

Connect to your PostgreSQL database and run the migration script:

```bash
psql -h 132.226.215.254 -p 5432 -U postgres -d postgres -f migrate-to-postgres.sql
```

Or copy the contents of `migrate-to-postgres.sql` and run it in your database management tool.

## Step 2: Update Your Application Configuration

**Note**: The current application code uses Supabase client which won't work with a standard PostgreSQL database.

You have two approaches:

### Approach A: Use a PostgreSQL client library

1. Install `pg` library:
```bash
npm install pg
```

2. Create a new database client file (e.g., `src/lib/postgres.ts`):
```typescript
import { Pool } from 'pg';

const pool = new Pool({
  host: '132.226.215.254',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '6ccQll56TmCaSwefKBduVQyIuYmBoTEkrMh6sfQkWnaYVy4omHP4WfyBzAJt1Qu8',
  ssl: false // Set to true if your server supports SSL
});

export default pool;
```

3. Rewrite all service files to use PostgreSQL queries instead of Supabase client

### Approach B: Keep Supabase for Auth + Use PostgreSQL REST API

Set up PostgREST or Hasura on your Coolify server to provide a REST API for your PostgreSQL database.

## Step 3: Authentication Strategy

Since your app relies heavily on Supabase Auth (`auth.uid()`), you'll need to:

1. **Remove RLS Policies**: The migration script doesn't include RLS policies because standard PostgreSQL doesn't support Supabase's `auth.uid()` function.

2. **Implement Application-Level Security**:
   - Add authentication middleware
   - Check user permissions in your application code
   - Use user_id from your JWT/session tokens

3. **Update All Service Files**:
   - `src/services/authService.ts` - Implement custom auth
   - `src/services/jobService.ts` - Add user_id checks
   - `src/services/teamService.ts` - Add user_id checks
   - `src/services/userService.ts` - Add user_id checks

## Step 4: Database Schema Differences

The migration creates a `users` table with:
- `id` (uuid)
- `email` (text)
- `password_hash` (text) - You'll need to implement password hashing
- `created_at`, `updated_at` (timestamps)

You'll need to:
1. Implement password hashing (use bcrypt or argon2)
2. Implement JWT token generation for authentication
3. Update your Auth component to work with the new system

## Step 5: Testing Checklist

After migration:
- [ ] Test user registration
- [ ] Test user login
- [ ] Test creating jobs
- [ ] Test viewing jobs
- [ ] Test updating jobs
- [ ] Test deleting jobs
- [ ] Test team creation
- [ ] Test team invitations
- [ ] Test team member management
- [ ] Test invoice generation

## Alternative: Use Supabase Self-Hosted

Consider using Supabase's self-hosted version on your Coolify server instead. This would:
- Keep all your current code working
- Give you full control over your data
- Maintain the same authentication system

See: https://supabase.com/docs/guides/self-hosting

## Need Help?

The migration involves significant architectural changes. Consider:
1. Starting with Supabase self-hosted for easier migration
2. Gradually migrating services one at a time
3. Implementing comprehensive tests before switching production traffic
