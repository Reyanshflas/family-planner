# Family Planner

A shared daily planner for the whole family. Each member writes their own daily plan, and there's a shared family board for everyone to post on.

Built with Next.js + SQLite.

## Run locally

```bash
npm install
npm run dev
```

Visit http://localhost:3000 and sign in with passcode `family123`.

## Deploy

**Railway (recommended):** Connect your GitHub repo, set `FAMILY_PASSCODE` as an environment variable, and deploy. Railway provides persistent disk so SQLite works.

**Render:** Create a Web Service from your GitHub repo. Set build command to `npm run build`, start command to `npm start`. Set `FAMILY_PASSCODE` env var.

> Do NOT deploy on Vercel — SQLite needs a writable filesystem which Vercel serverless doesn't provide.

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `FAMILY_PASSCODE` | `family123` | Shared login passcode |
| `DATA_DIR` | `./data` | Directory for the SQLite database |
