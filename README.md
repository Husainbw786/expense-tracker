# 🧳 Trip Splitter

A simple, mobile-friendly app to split a group/family trip's expenses and figure out
**who pays whom** at the end. Built as a single Next.js codebase — frontend and backend
together, deploys as one app.

## What it does

- Keep a permanent **People** roster — your families and the people in them, created
  once and **reused for every trip**.
- **Create a trip** (one per family outing), then add whole families or individual
  people to that trip.
- Log every **expense** within a trip: what it was, how much, who paid, and **who
  shares it** (default = everyone on the trip; just un-tick anyone who wasn't there —
  e.g. people who left partway through).
- See each trip's **total cost**, every family's spending vs. their fair share, and a
  per-person breakdown.
- Get an automatic **"who pays whom"** settlement that uses the fewest transfers —
  money a family already spent is automatically deducted from what they owe.

## How you'll use it

1. **People** tab → add your families and everyone in them (one time).
2. **Trips** tab → "Start a new trip" → it opens *Who's on this trip*.
3. Tap **Add whole family** or individual names to put people on the trip.
4. **Add** tab → log expenses as they happen.
5. **Summary** tab → see totals and who pays whom.

Next trip? Just create another one and re-add the same people — the roster is already there.

## Run it on your computer

```bash
npm install
npm run db:push    # creates the database tables (a local file: local.db)
npm run seed       # OPTIONAL: load demo data so you can see it working
npm run dev        # open http://localhost:3000
```

Open it on your phone too: while `npm run dev` is running, visit
`http://<your-computer-ip>:3000` from a phone on the same Wi-Fi.

To start fresh (remove demo data), open the **People** screen and delete the demo
families, or just re-run `npm run seed` (it wipes and reloads demo data).

## Make it shared across phones (deploy)

Locally the app stores data in a file (`local.db`). For several family members to add
expenses from their own phones and all see the same totals, you need one free shared
database. Easiest is **Turso** (SQLite in the cloud):

1. Create a free account at <https://turso.tech> and make a database.
2. Copy its **Database URL** and an **auth token**.
3. Deploy to **Vercel** (free): push this folder to GitHub, import it at
   <https://vercel.com/new>, and add two Environment Variables:
   - `DATABASE_URL` = `libsql://your-db-name.turso.io`
   - `DATABASE_AUTH_TOKEN` = your token
4. After the first deploy, create the tables once against the cloud DB. From your
   computer, with the same two values in a local `.env` file, run `npm run db:push`.

That's it — share the Vercel URL with the family and everyone can add expenses.

## How the math works

For each person: **paid** = what they spent, **share** = their slice of every expense
they were part of (`amount ÷ number of people sharing it`), and **net = paid − share**.
Positive net means they should get money back; negative means they owe. Families are the
sum of their members. The settlement greedily matches the biggest receiver with the
biggest payer until everyone is square. The core logic lives in `src/lib/calc.ts`.

## Tech

Next.js (App Router) · TypeScript · Tailwind CSS · Drizzle ORM · libSQL/SQLite.
