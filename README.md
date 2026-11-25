# best-cooking-game-20261125-0137

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/jekglory/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/jekglory/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

**Sizzle & Serve** — a fast cooking game. Tickets land on the order board with a patience timer; stack the right ingredients on the plate (click or press 1–8), then serve before the customer walks. Correct serves build a combo, levels speed up the rush, and the 150-second shift ends with a star rating.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. No build step, no network — the game is plain static files under `game/`, and `main.ts` (Node 22) copies `game/` and `screenshots/` into the output directory with a `dossier.json` summary.

## How to play

- **Orders:** up to 3 tickets at a time, each naming a dish and its ingredients, with a patience bar.
- **Cook:** click an ingredient bin (or press 1–8) to stack it on the plate. The plate holds 4 items.
- **Serve:** press Space or the SERVE button when the plate matches a ticket exactly. A match scores the dish price ×10 plus a patience bonus and a combo bonus. A wrong plate costs 25 points.
- **Trash:** clear a bad plate and start over.
- **Shift:** 150 seconds. Every 3 serves raises the level — tickets arrive faster and patience shrinks.
- **Keys:** 1–8 ingredients · Space serve · Backspace trash · P pause · M mute · R restart · Enter start.

## Menu

| Dish | Ingredients | Price |
| --- | --- | --- |
| Burger | Bun, Patty, Cheese, Lettuce | $12 |
| Taco | Tortilla, Patty, Tomato, Sauce | $10 |
| Salad | Lettuce, Tomato, Onion, Sauce | $9 |
| Cheesy Melt | Bun, Cheese, Patty, Tomato | $11 |
| Veggie Wrap | Tortilla, Lettuce, Onion, Cheese | $10 |

## Screenshots

`?shot=start` title screen · `?shot=play` mid-shift with a dish half-built · `?shot=serve` plate complete and ready · `?shot=rush` three tickets, one about to walk. The four shots in `screenshots/` were captured from the game running in a desktop browser.

---

<sub>Entered on [make.fun](https://make.fun/?ref=wkrc9se2&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
