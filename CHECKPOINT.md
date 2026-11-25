# CHECKPOINT — best-cooking-game-20261125-0137 ("Sizzle & Serve")

## Entry
- Competition: best-cooking-game-20261125-0137 — "Make the best cooking game", $250 (top 10 share), entries close 2026-11-25T13:37:00Z (20:37 WIB), result due 2026-12-10.
- Repo: https://github.com/jekglory/best-cooking-game-20261125-0137 (public, created 2026-11-25T02:13:13Z, after the 01:37Z opening)
- Commit: `1cf49cca4f89c3fbaa003a4ef505daed3915d943` (branch `main`, pushed; `git ls-remote` HEAD matches)
- Previous commit: `5fbfba2e100d1825b49d790c4822c9d86948af2d` (full game + README + owner.json); `1cf49cc` refreshes the 4 screenshots to the final render.
- About set: description "Sizzle & Serve — a fast cooking game. Built by an AI agent for make.fun's “Make the best cooking game” bounty, $250 in USDC.", homepage https://make.fun/bounty/best-cooking-game-20261125-0137, topics makefun, ai-agents, bounties, games.
- `.makefun/owner.json` names wallet 8rCWeWgLhbrjRJnW3sLDfPBVLR481kFnoGVsghPPCJjG. LICENSE is the kit MIT text. README carries the three make.fun badges + referral code wkrc9se2.

## The game
"Sizzle & Serve": 150-second lunch-rush shift. Up to 3 order tickets on the order board, each with a patience bar and seconds left. 8 ingredient bins on the counter (click or keys 1–8) stack onto the central plate (max 4); SERVE (Space/button) when the plate exactly matches a ticket. Correct serve: dish price ×10 + patience bonus + combo bonus; wrong plate: −25 and combo reset; expired ticket: customer walks, −10. Every 3 serves levels up (faster spawns, shorter patience). 5 dishes (Burger, Taco, Salad, Cheesy Melt, Veggie Wrap), combo meter, star rating at shift end, synthesized WebAudio SFX (M mutes), pause (P), restart (R). Pure static files under `game/`, no network, no libraries. `main.ts` (Node 22, stdlib only) copies `game/` + `screenshots/` to the output dir and writes `dossier.json` via vendored `vendor/makefun-game.ts` (byte-identical to the kit's).

## Verification (all done, BUILD-ONLY — not bundled, not checked, not submitted)
- `main.ts` run twice with different output dirs: byte-identical output (deterministic). Re-run on the final tree: `game/` identical.
- Screenshots: 4 JPEGs in `screenshots/`, all ≤ 256 KiB (91,795 / 116,355 / 115,271 / 122,612 bytes), 1280×800, captured with Playwright-cached Chromium headless from `node serve.ts` on localhost:8080, `?shot=start|play|serve|rush&seed=7`. Visually inspected: title screen, mid-shift with a half-built Burger on the plate, SERVE lit green with "Matches order #7 — Burger!", rush with 3 tickets and one at 6s patience. Fixed 4 layout overlaps found in review (toast over kitchen header, Best-combo over keys hint, mute label over timer bar, bins over counter title, toast over panel seam).
- Live play-test via CDP (keyboard only): Enter started the shift, keys 1-2-3-4 built a Burger, Space served it — Score 0 → 168, coins 12, Served 1, Best combo 1, "+168" floater, "Served Burger! +168 points." Order #2 spawned. Full loop works.
- Repo verified live: public, HEAD `1cf49cc`, page returns HTTP 200.
- Known non-issue: GitHub's license API reports NOASSERTION for the kit's MIT LICENSE (SPDX line on top); the file is the kit's standard MIT text, same as the earlier submitted stealth entry, and make.fun's license check accepts it.

## Still to do (parent)
- Bundle transcripts with the kit CLI, run kit `check` on the exact bundle, check quota, then submit before 13:37Z today. Do NOT claim any prize without Adam's permission.
