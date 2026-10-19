# 🕹️ ArcadeKit

**Instant multiplayer games with friends. No downloads, no accounts.**

ArcadeKit is a lightweight, mobile-first multiplayer game platform where you can create a room, share a link, and start playing within seconds.

## Quick Start

```bash
# Install dependencies
yarn install
cd game-server && npm install && cd ..

# Terminal 1 — Next.js frontend (hot reload)
yarn dev                # → localhost:3000

# Terminal 2 — Game server (hot reload via tsx)
yarn dev:server         # → localhost:3001
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Games

| Game | Players | Type | Duration |
|------|---------|------|----------|
| ❌ Tic Tac Toe | 2 | Strategy | ~2 min |
| ✊ Rock Paper Scissors | 2 | Quick | ~2 min |

## How It Works

1. **Pick a game** from the games page
2. **Create a room** — you get a unique 4-character code
3. **Share the link** — friends join instantly in their browser
4. **Play!** — no sign-up, no download

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- **Game Server:** Node.js, WebSocket (`ws`), TypeScript
- **Animation:** Framer Motion
- **State:** Zustand
- **Deployment:** Docker, Nginx, Hetzner Cloud

## Architecture

```
game-network/
├── src/                    # Next.js frontend
│   ├── app/                # App Router pages
│   ├── components/         # UI + game shell components
│   ├── games/              # Game modules (plug-in architecture)
│   └── lib/                # Stores, hooks, utilities
├── game-server/            # WebSocket game server
│   └── src/
│       ├── engines/        # Game logic engines
│       ├── Room.ts         # Room management
│       └── index.ts        # Server entry
├── shared/                 # Shared types (client + server)
└── docker/                 # Production Docker config
```

## Adding a New Game

See [docs/ADDING_GAMES.md](docs/ADDING_GAMES.md) for the complete guide.

Each game requires:
- 4 client files (types, logic, component, definition)
- 1 server engine
- 2 registry entries (1 line each)

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Public site URL |
| `NEXT_PUBLIC_WS_URL` | `ws://localhost:3001` | WebSocket URL (client) |
| `GAME_SERVER_INTERNAL_URL` | `http://localhost:3001` | Game server URL (server-side) |

## Production Deployment

Secrets go in `docker/.env` on the server (see the variables in `docker/docker-compose.yml`).

```bash
cd docker
docker-compose build
docker-compose up -d
```

`up` also applies any new database migrations before the site starts (the `migrate` service), so there is no separate step.

### Database backups

The `backup` service dumps Postgres to `docker/backups/` on start and every night at 03:00 UTC, keeping 14 days. The dumps are on the same disk as the database, so also keep an off-server copy: turn on Hetzner's server backups, or copy the folder elsewhere.

Take a backup by hand (e.g. before a risky deploy):

```bash
docker-compose exec backup sh /backup-db.sh once
```

Restore one (this replaces the current data):

```bash
docker-compose stop web
docker-compose exec -T postgres pg_restore -U arcadekit -d arcadekit --clean --if-exists --no-owner < backups/arcadekit-YYYY-MM-DDTHHMMZ.dump
docker-compose start web
```

Target: Hetzner Cloud CX31 (2 vCPU, 8GB RAM, ~€8.50/month)

## License

Private — All rights reserved.
