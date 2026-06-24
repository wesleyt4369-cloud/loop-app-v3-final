# Loop

Appointment reminders, no-show recovery, and re-engagement texts — for one
business, deployed and run by you. This is real, working code: when you wire
up Twilio, it sends real text messages.

## What you're deploying

A private dashboard (password-protected) where you manage one business's
clients and appointments. It runs in any browser, on phone or PC, and can be
"installed" to a phone home screen like an app (no App Store needed).

**Important: this is a single-business deployment.** If you want to sell this
to multiple business owners, the simplest approach right now is to deploy a
separate copy for each client (separate database, separate Twilio number,
separate URL). That's the standard early-stage approach — it avoids building
a complex multi-tenant signup/billing system before you've proven anyone wants
to pay. We can build true multi-tenant SaaS later once you have a few paying
clients on this model.

## What you need before you start (all free or near-free)

1. A **GitHub account** (free) — to hold the code
2. A **Vercel account** (free tier is enough) — to host the site
3. A **Neon** or **Supabase** account (free tier) — for the database
4. A **Twilio account** — pay-as-you-go, roughly $1.15/month for a number
   plus ~$0.008 per text

## Step-by-step

### 1. Get the code onto GitHub
- Create a new empty repository on GitHub
- Upload everything in this folder to it (or use `git init`, `git add .`,
  `git commit`, `git push` if you're comfortable with git)

### 2. Create your database
- Go to neon.tech (or supabase.com), create a free project
- Copy the **connection string** they give you — it looks like
  `postgresql://user:pass@host/dbname`

### 3. Create your Twilio number
- Sign up at twilio.com
- Buy a phone number (Phone Numbers → Buy a Number) — pick one with a local
  area code if you can
- From the Twilio Console dashboard, copy your **Account SID** and
  **Auth Token**

### 4. Deploy to Vercel
- Go to vercel.com → New Project → import your GitHub repo
- Before deploying, add these Environment Variables (from `.env.example`):
  - `DATABASE_URL` — your Neon/Supabase connection string
  - `APP_PASSWORD` — whatever password you want to log in with
  - `SESSION_SECRET` — any long random string
  - `BUSINESS_NAME` — the business name to show in texts
  - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
  - `CRON_SECRET` — any long random string
- Click Deploy

### 5. Set up the database tables
After your first deploy, run this once from your local machine (with the
same `DATABASE_URL` in a local `.env` file):
```
npm install
npx prisma migrate deploy
```
If you don't have Node.js installed locally, Vercel's docs also show how to
run this from their dashboard — search "Vercel Postgres Prisma migrate" if
you get stuck.

### 6. Turn on automatic daily texts
The `vercel.json` file in this project already tells Vercel to run the
reminder job once a day. As long as `CRON_SECRET` is set in your environment
variables, this works automatically — no extra setup needed. (Vercel's free
tier allows daily cron jobs.)

### 7. Log in and try it
- Visit your new Vercel URL
- Log in with the `APP_PASSWORD` you set
- Add a test appointment using **your own phone number** and check
  "Send confirmation text now" — you should get a real text within seconds

### 8. Install it on your phone
- Open the site in Safari (iPhone) or Chrome (Android)
- Tap Share → "Add to Home Screen" (iPhone) or the install prompt (Android)
- It now opens like a regular app

## Costs to expect
- Hosting (Vercel free tier): $0
- Database (Neon/Supabase free tier): $0
- Twilio number: ~$1.15/month
- Texts: ~$0.008 each — for ~20 clients getting 2 texts/week, that's under
  $2/month

## If something breaks
Most issues come from a missing or mistyped environment variable. Check
Vercel's "Deployments" → your latest deploy → "Functions" logs for the exact
error.
