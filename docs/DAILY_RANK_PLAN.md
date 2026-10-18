# Daily Ranking Game — Plan

Drafted with Mark on 2026-10-13, revised 2026-10-15. Nothing here is built
yet. Built on a branch off `feat/accounts`; the two launch together.

Working name **"Daily Rank"**. The name lives in one constant
(`DAILY_GAME_NAME` plus the route slug in one config file) so it's easy to
change later.

## The game in one paragraph

Once a day, everyone gets the same puzzle: 3 rounds, each with a category
("Rank by height, tallest first") and 5 items (e.g. 5 mountains). You put
the 5 items in order and lock it in. The real values are revealed with a
score for that round, then you go to the next round. Each round comes from
a different theme, so one day might be mountains, then inventions, then
countries. After round 3 you see your total, how you did compared to
everyone else today, a share grid, your streak, and a countdown to
tomorrow. About 2–3 minutes. No account needed to play.

## Scoring

Each item scores on how close you put it to its real spot:

| Where you put it | Points | Share grid |
|---|---|---|
| Exactly the right spot | 2 | 🟩 |
| One spot away | 1 | 🟨 |
| Two or more spots away | 0 | ⬜ |

5 items × 2 points = **10 per round**, 3 rounds = **30 per day**.

Example. Real order (tallest first): Everest, K2, Kilimanjaro, Mont Blanc,
Mount Fuji. You guessed: Everest, Kilimanjaro, K2, Mount Fuji, Mont Blanc.

- Everest: right spot → 🟩 2
- Kilimanjaro: you put it 2nd, really 3rd → 🟨 1
- K2: you put it 3rd, really 2nd → 🟨 1
- Mount Fuji: you put it 4th, really 5th → 🟨 1
- Mont Blanc: you put it 5th, really 4th → 🟨 1

Round score 6/10. Share line: 🟩🟨🟨🟨🟨

Share text for the whole day:

```
Daily Rank #12 — 24/30 (top 18%)
🏔️ Nature    🟩🟩🟩🟨🟨
💡 History   🟩🟨🟨⬜⬜
🌍 World     🟩🟩🟩🟩🟩
arcadekit.games/daily
```

## No public leaderboard: percentile instead

A public top-100 is easy to cheat (look up the answers) and fills up with
perfect scores, and it needs public display names. So at launch there's no
public leaderboard. Instead, after you finish:

- **"You scored higher than 82% of players today"** (percentile among
  everyone who finished today's puzzle, guests included).
- **Today's score distribution**, a small bar chart from 0–30 with your bar
  highlighted (like Wordle's guess distribution).

A few people looking up answers barely moves a percentile, so it stays
meaningful. And with no public names, there's no nickname question.

**Later (good fit for accounts or Plus):** private leaderboards with
friends. Cheating matters much less among friends, and it ties into the
multiplayer side of the site.

## Puzzle day and reset

- A new puzzle every day at the player's **local midnight** (like Wordle and
  GeoSlice). Puzzle #1 is launch day; the number is the count of days since then.
- Percentiles are per puzzle number, so someone in Tokyo and someone in
  New York are compared on the same #12 even though they played hours apart.
- The server only accepts puzzle N while it's day N somewhere on Earth
  (UTC−12 to UTC+14), so nobody can play tomorrow's puzzle early.

## Themes and data (general knowledge, not just geography)

Each day's 3 rounds come from 3 different themes. Launch target: 5 themes,
about 15 categories, each with a hand-checked list of items people have
heard of.

| Theme | Example categories | Source | License |
|---|---|---|---|
| 🌍 World | Country population, country area, capital farthest north, city elevation | GeoNames files from TerraVia (`../travel-map/prisma/data/`) | CC BY 4.0 (credit line) |
| 🏔️ Nature | Mountain height, river length, lake area, animal weight | Wikidata | CC0 |
| 🏛️ Built | Building height, bridge length, landmark year completed | Wikidata | CC0 |
| 💡 History | Invention year, company founding year, event year | Wikidata | CC0 |
| 🪐 Space | Planet/moon size, distance from the Sun, gravity | NASA fact sheets | Public domain |

Possible additions: 🍎 Food (calories per 100 g, USDA FoodData Central,
public domain), 🎬 Pop culture years (film / video game / album release
years from Wikidata; years are facts, so this is fine. Avoid IMDb, Box
Office Mojo and sports stats sites, whose licenses are restrictive).

### How each category is built

1. A script pulls candidates (Wikidata query, GeoNames file, or NASA table).
2. **Fame filter:** for Wikidata, keep items with many Wikipedia language
   versions (the "sitelinks" count). It's a simple stand-in for "people have
   heard of it": Mount Everest has hundreds, an obscure peak has two.
3. The result is written to `shared/daily/packs/<theme>.json` and **reviewed
   by hand** (remove odd items, fix names, check values). Committed to the
   repo. Aim for 40–100 items per category.
4. Each item: id, name, emoji or short descriptor ("Mountain in Nepal"), value,
   unit, and a source link shown on the reveal.

Scripts live in `scripts/daily/`. They're run by hand when we add or refresh
a category, never at build time.

### World theme details

From TerraVia's raw GeoNames/OurAirports files (not its database):
countries pool = 161 countries with 1M+ people, cities pool = 543 cities
with 1M+ people. City elevation is filled in for nearly all big cities.
GeoNames population numbers are a few years old; the gap rule (below) keeps
that from mattering. **City population is left out**: GeoNames mixes
city-proper and metro counts, so players would rightly argue with the
answers.

Credit line on the page: "Some data from GeoNames (geonames.org), CC BY
4.0. Other data from Wikidata and NASA."

## Making a puzzle

A generator turns a puzzle number into 3 rounds:

1. **Pick 3 different themes**, then one category in each, avoiding
   categories used in the last few days.
2. **Pick 5 items** from that category's list.
3. **Gap rule:** next to each other in the real order, every item must be at
   least **25% bigger** than the next (years: at least 10 years apart;
   latitude: at least 3°). No coin flips, and slightly stale data can't
   change the order.
4. Mix very famous and less famous items (weight by the fame score).
5. No item appears twice in the same day.

It's a seeded random generator: same puzzle number → same puzzle, every
time. Optional `overrides.json` lets us hand-fix a day.

### Keeping answers secret

The answers stay on the server until you submit a round. That's not about
a leaderboard anymore. It keeps "view source" from spoiling the puzzle and
keeps the percentiles honest.

- The generator runs only on the server and mixes a secret
  (`DAILY_SEED_SECRET`) into the seed, so the code alone can't produce
  tomorrow's puzzle.
- The browser gets each round's category and 5 items in a shuffled order,
  without values.
- Submitting a round returns the real order, values, and score for that
  round only. A round can't be resubmitted.

## Pages and API

| Route | What it is |
|---|---|
| `/daily` | Today's puzzle (indexable, short how-to-play below the game for SEO) |
| `/daily/stats` | Your stats: played, average, current and best streak, your score distribution |
| `GET /api/daily/today?n=12` | Rounds without answers + a play token |
| `POST /api/daily/12/round/1` | `{ order: [...] }` → real order, values, score |
| `GET /api/daily/12/distribution` | Today's score counts (0–30), cached for a minute |

Home page: a "Today's daily" card at the top, separate from the multiplayer
grid, since it's the thing that brings people back each day.

### Ordering on phones (45% of traffic is mobile)

**Tap to place:** tap an item, then tap a slot 1–5 (or tap two items to
swap them). Dragging also works on desktop. One screen, no scrolling, big
tap targets.

## Guests vs. accounts

The idea: guests get a streak so they have something to lose, and the
sign-in prompt offers to protect it. Losing something you already have is
a stronger push than "sign in to start a streak".

| | Guest | Signed in |
|---|---|---|
| Play the daily | ✅ | ✅ |
| Percentile + today's distribution | ✅ | ✅ |
| Streak | ✅ in this browser only | ✅ saved to the account, every device |
| Stats page | Basic (this browser) | Full history |
| Survives clearing the browser / new phone | ❌ | ✅ |
| Later: friends leaderboards, practice, archive | ❌ | ✅ / Plus |

### The sign-in prompt

Shown on the results screen after round 3, never before or during play:

> **Keep your 4-day streak**
> Your streak only lives in this browser. Sign in to save it and your stats
> on any device.
> [Continue with Google] [Use email] · *Not now*

- On day 1 (no streak yet) it says "Start a streak" instead.
- "Not now" hides it for 3 days.
- After signing in, they come straight back to their results.

### Saving to the account

New tables (Drizzle, alongside the accounts tables):

```
daily_results
  id
  user_id       → user.id, nullable (guests' results count toward percentiles)
  puzzle_number int
  score         int          (0–30)
  rounds        jsonb        per-round score + grid
  completed_at  timestamptz
  unique (user_id, puzzle_number) where user_id is not null

daily_progress   (in progress; stops resubmitting a round)
  play_token, puzzle_number, user_id (nullable), rounds_done, started_at
```

Streaks are calculated from `daily_results` (consecutive puzzle numbers),
not stored, so they can't get out of sync.

**First sign-in:** the browser's saved history is uploaded to the account
(only puzzles the account doesn't have yet), so the guest streak carries
over. That's the whole promise of the prompt.

## Analytics (added to `shared/analytics.ts`)

| Event | Properties |
|---|---|
| `daily-start` | `puzzle` |
| `daily-round` | `puzzle`, `round`, `theme`, `category`, `score` |
| `daily-complete` | `puzzle`, `score`, `streak`, `signed_in` |
| `daily-share` | `puzzle`, `method` (copy / share sheet) |
| `daily-signin-prompt` | `action` (shown / google / email / not-now) |

`daily-round` broken down by `theme` and `category` shows what people like,
which tells us which themes to grow and which could be paid.

## Later: choose your theme (and where Plus could fit)

- **Practice mode:** pick a theme or category and play random puzzles.
- **Archive:** play any past daily.
- **Friends leaderboards.**
- More themes and categories, guided by the analytics.

Plus candidates (decide later; ask before building paid features):
unlimited practice (free gets a few a day), the full archive, specific
themes, detailed stats. The daily puzzle itself always stays free.

## Build order

On a new branch off `feat/accounts`.

1. **Data:** scripts + the 5 theme packs + generator with the gap rule,
   plus a script that prints the next 30 days so we can eyeball them.
   Mark reviews the packs.
2. **Game:** `/daily` page, tap-to-place UI, server grading, results screen
   with percentile and distribution, share text, analytics events.
3. **Streaks and accounts:** guest streaks in the browser, tables, saving
   results, history upload on first sign-in, the sign-in prompt,
   `/daily/stats`.
4. **Launch:** home page card, how-to-play guide, sitemap, credit line,
   privacy policy note. Accounts and the daily game go live together.
5. **Later:** practice mode, archive, friends leaderboards, Plus.

## Open questions for Mark

1. ~~Themes~~ Decided 2026-10-15: the 5 themes plus 🍎 Food.
2. **Name.** "Daily Rank" for now; revisit before launch.

## Progress (branch `feat/daily-rank`, off `feat/accounts`, nothing committed)

Updated 2026-10-16. Built, typecheck + lint clean, and tested in the
browser as a guest (play, reload mid-game, results, phone width, server
rejects replays/bad orders/future dates). **Not yet tested: sign-in
carrying a guest streak over** (needs Mark, since dev email is live).

### Changes from the plan while building

- **Puzzles are saved** (`daily_puzzle` table) the first time anyone opens
  them, with names, values and formatting included. Otherwise adding a
  category (e.g. Food) would change every past puzzle.
- **One `daily_play` table** instead of results + progress: one row per
  play, guests included (no user_id). Signing in claims the guest rows
  whose tokens are in the browser's history, so the streak carries over
  and every result was graded by the server.
- **Stars dropped** (Wikidata times out; distances are disputed).
- **Flags are hidden on Windows**, which has no flag emoji.
- **Percentile** counts ties as half; the wording is gentle at the bottom.
- **Landmarks and famous people are hand-entered** with Wikipedia links
  (Wikidata mixes "started" and "finished" years; the people query times
  out). Each has a build script like Space.
- **Stats** are on the results screen (played, streak, best streak,
  average) instead of a separate `/daily/stats` page for now.
- Puzzle #1 date: `DAILY_FIRST_DATE` in `src/lib/daily/config.ts`, set to
  2026-10-01 for dev. **Change it to launch day before launch.**

### Categories (17 in the daily, 7 held back for packs)

Rule (Mark, 2026-10-16): the daily only uses things nearly everyone has
heard of. Niche categories keep their data with a `pack` tag for a
future pick-your-pack mode.

- World (GeoNames): country population, country size, population
  density (about 80 well-known countries), capitals north to south (about
  60 well-known capitals).
- Animals (hand-entered from Wikipedia): weight, top speed, pregnancy
  length.
- Built (hand-entered): famous structures by height, landmarks by year
  finished.
- History: inventions (Wikidata, hand-picked ids), companies (Wikidata,
  with exclusions), famous people by birth year (hand list).
- Space (NASA): diameter, distance from the Sun, day length, gravity,
  temperature.
- Held back: `geography` pack (mountains, rivers, lakes, islands, city
  elevation), `sports` (stadiums), `architecture` (Wikidata buildings).

Puzzle #16 in the local dev DB was saved before this change, so it still
has mountains; every later day uses the new list.

### Files

- Data scripts: `scripts/daily/` (`fetch-wikidata.mjs`, `build-geonames.mjs`,
  `build-space.mjs`, `build-landmarks.mjs`, `build-people.mjs`, `preview.ts`)
- Items: `src/lib/daily/items/*.json`
- Logic: `src/lib/daily/` (config, categories, generator, puzzles, plays,
  scoring, history, types, http)
- API: `src/app/api/daily/` (GET puzzle, POST round, GET/POST me)
- UI: `src/app/daily/` (page, DailyGame, RoundBoard, RoundRevealView, Results)
- DB: `daily_puzzle` + `daily_play` in `src/lib/db/schema.ts`, migration
  `drizzle/0002_daily_rank.sql` (applied to local dev DB)
- Also: home page card, header "Daily" link, sitemap, privacy policy,
  analytics events, `DAILY_SEED_SECRET` in `.env.example` + compose.

Preview upcoming puzzles (WSL):
`node node_modules/.bin/tsx scripts/daily/preview.ts 1 30`

### Next

1. Mark tests signing in from the results screen: the guest play and
   streak should move to the account.
2. Food theme once Mark has an api.data.gov key (USDA FoodData Central).
3. Review the item lists once more by hand (companies, islands,
   stadiums, buildings are the noisiest).
4. Before launch: set `DAILY_FIRST_DATE`, add `DAILY_SEED_SECRET` to
   `docker/.env` on the server, how-to-play guide page.
