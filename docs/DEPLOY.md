# Deploying Heritage CU to Vercel

Follow these steps in order. The whole process takes about 10–15 minutes.

---

## Step 1 — Push Code to GitHub

1. Go to [github.com](https://github.com) → click **New repository**
2. Name it `heritage-ccu` (or anything you like), set it to **Private**, click **Create**
3. In your terminal, inside the `banking/` folder, run:

```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/heritage-ccu.git
git push -u origin main
```

> Replace `YOUR_USERNAME` with your actual GitHub username.

---

## Step 2 — Import Project to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Click **Import** next to your `heritage-ccu` repo
3. Leave all settings as default — Vercel auto-detects Next.js
4. **Do NOT click Deploy yet** — you need to add environment variables first

---

## Step 3 — Add Vercel Postgres (Neon Database)

1. In your Vercel project, go to the **Storage** tab
2. Click **Create Database** → select **Postgres (Neon)** → click **Create**
3. Name it `heritage-ccu-db` → click **Create & Continue**
4. On the next screen, click **Connect** to link it to your project
5. Vercel will automatically add `POSTGRES_URL` (and a few others) to your environment variables

---

## Step 4 — Add Remaining Environment Variables

Still in Vercel, go to **Settings → Environment Variables** and add these:

| Name | Value |
|------|-------|
| `JWT_SECRET` | `heritage_community_credit_union_super_secret_key_2026` |
| `ADMIN_USERNAME` | `hccu_admin` |
| `ADMIN_PASSWORD` | `Heritage@Admin2026` |

Set all three to apply to **Production**, **Preview**, and **Development**.

---

## Step 5 — Set Up the Database Tables

You need to run the setup script once to create the tables. Do this locally:

1. In Vercel, go to **Settings → Environment Variables**
2. Copy the value of `POSTGRES_URL`
3. Paste it into your local `.env.local` file:

```
POSTGRES_URL=postgres://...your-neon-connection-string...
```

4. In your terminal (inside the `banking/` folder), run:

```bash
npm run db:setup
```

You should see output like:
```
🔌  Connected to Postgres. Creating tables…
  ✅  users
  ✅  transactions
  ✅  notifications
  ✅  loans
  ✅  beneficiaries
  ✅  indexes

🌱  Demo user seeded:
     Email:    demo@heritageccu.com
     Password: Demo@1234
     Balance:  $5,000

🎉  Database setup complete!
```

---

## Step 6 — Deploy

1. Go back to Vercel → click **Deploy**
2. Wait ~2 minutes for the build to finish
3. Vercel gives you a live URL like `https://heritage-ccu.vercel.app`

That's it — your app is live!

---

## After Deployment

### Create real user accounts
- Go to `https://your-app.vercel.app/admin/login`
- Username: `hccu_admin` | Password: `Heritage@Admin2026`
- Use **Create Member** to add real user accounts

### Delete the demo account
- In the admin dashboard, find `demo@heritageccu.com` and delete it when you're ready

### Custom domain (optional)
- In Vercel → **Settings → Domains** → add your own domain (e.g. `heritageccu.com`)

---

## Troubleshooting

**Build fails with "POSTGRES_URL is not defined"**
→ Make sure you connected Vercel Postgres in Step 3 and redeployed

**`npm run db:setup` fails with "connection refused"**
→ Make sure the full `POSTGRES_URL` from Vercel is pasted into `.env.local` (no extra spaces)

**Login not working after deploy**
→ Double-check `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` are set in Vercel env vars

**tsx not found when running db:setup**
→ Run `npm install -D tsx` first, then try again
