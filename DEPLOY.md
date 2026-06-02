# 🚀 Deploy Trip Splitter (Vercel + Turso)

Goal: a live URL your family can open on their phones, backed by one shared cloud
database. Free on both. Follow the parts in order. Steps marked **[you]** are quick
things you do; steps marked **[Claude]** I'll run for you once you say the previous
step is done.

---

## Part A — Create the cloud database (Turso) · **[you]** · ~5 min

1. Go to **https://turso.tech** and sign up (free — use Google/GitHub for speed).
2. Create a **Group** if asked (any name), pick a region near you (e.g. Mumbai/`bom`).
3. Create a **Database** (any name, e.g. `trip-splitter`).
4. On the database page, find and copy two things:
   - **Database URL** — looks like `libsql://trip-splitter-xxxx.turso.io`
   - **Token** — click *"Create Token"* / *"Generate Token"* and copy the long string.
5. In the `trip-splitter` folder, create a file named **`.env`** with exactly these two
   lines (paste your real values):

   ```
   DATABASE_URL=libsql://your-db-name.turso.io
   DATABASE_AUTH_TOKEN=your-long-token-here
   ```

   👉 Keep this token private. The `.env` file is already git-ignored, so it won't be
   shared. Tell me once it's saved.

---

## Part B — Put the tables + your real data into the cloud DB · **[Claude]**

Once your `.env` is saved, I'll run (these read your `.env`, so they hit the cloud DB):

```
npm run db:push      # creates the tables in your cloud database
npm run import       # loads your real families / people / expenses
```

(Your data goes in `src/db/import.ts` — give me the data and I'll fill it in.)

---

## Part C — Deploy the app (Vercel) · **[you]**, I'll guide each prompt

In your terminal:

```
cd trip-splitter
npx vercel login        # choose a login method; approve in the browser
npx vercel              # press Enter to accept defaults — it detects Next.js
```

Then add the two environment variables so the live app can reach the database:

```
npx vercel env add DATABASE_URL          # paste the libsql:// URL, choose "Production"
npx vercel env add DATABASE_AUTH_TOKEN   # paste the token, choose "Production"
```

Publish to a real URL:

```
npx vercel --prod
```

Vercel prints your live link (e.g. `https://trip-splitter-xxxx.vercel.app`). Open it,
and share it with the family. 🎉

---

## Updating later

- Change data or settle up? Just use the live app — it writes to the shared cloud DB.
- Change the code? Run `npx vercel --prod` again (or connect the repo to GitHub for
  auto-deploys).
