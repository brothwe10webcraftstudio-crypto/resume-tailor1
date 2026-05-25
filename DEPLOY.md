# Deploy Resume Tailor AI — Step by Step

## What you need (all free)
- GitHub account
- Vercel account (sign in with GitHub)
- Supabase account
- Gemini API key  (aistudio.google.com)

## Step 1 — Push to GitHub
1. Go to github.com → New repository → name it "resume-tailor"
2. Upload all these project files to it

## Step 2 — Connect Supabase
Your Supabase project is already set up by Bolt.
The URL and anon key are in your .env file.

In Supabase dashboard:
1. Go to Edge Functions → tailor-resume
2. Add secret: GEMINI_API_KEY = your_gemini_key

## Step 3 — Deploy frontend to Vercel
1. Go to vercel.com → Add New Project → import your GitHub repo
2. Add these environment variables:
   - VITE_SUPABASE_URL (from your .env file)
   - VITE_SUPABASE_ANON_KEY (from your .env file)
3. Click Deploy → done!

## Step 4 — Run the database migration
In Supabase → SQL Editor → paste contents of:
supabase/migrations/20260525071528_001_initial_schema.sql
→ Run it
