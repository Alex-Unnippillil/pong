# PhotonPong

Modern Pong built with Next.js, Phaser 3, and a serverless stack.

## Setup

```bash
pnpm install
pnpm prisma migrate dev
pnpm dev
```

Copy `.env.example` to `.env.local` and fill in secrets.

### Environment variables

Configure Upstash credentials using the following names:

- `UPSTASH_REDIS_URL` – Upstash Redis REST URL
- `UPSTASH_REDIS_TOKEN` – Upstash Redis REST token

Use these names when setting deployment secrets.

## Architecture Overview

```mermaid
graph LR
  subgraph Client
    A[Next.js + Phaser]
  end
  A -->|Realtime| B[Supabase]
  A -->|HTTP| C[Next.js API Routes]
  C --> D[(Postgres)]
  C --> E[(Upstash Redis)]
```

## Background jobs

When a match score is reported, a message is published to the `leaderboard:recalc`
Redis channel. A separate worker can subscribe to this channel and rebuild the
leaderboard asynchronously.

## Offline Testing

To verify the service worker's offline cache:

1. Run `pnpm dev` and open the app in your browser.
2. In DevTools, confirm the service worker is registered under **Application → Service Workers**.
3. Switch the Network panel to **Offline** and reload the page.
4. The app should load using cached assets even without a network connection.

## Troubleshooting

- Ensure Postgres database is reachable via `DATABASE_URL`.
- Run `pnpm prisma migrate dev` after changing the schema.
- If Playwright tests fail, install browsers with `npx playwright install`.
