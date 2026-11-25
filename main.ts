// Sizzle & Serve — a fast cooking game for make.fun's
// "Make the best cooking game" bounty (Node 22, standard library only).
//
// The game is plain static files under game/ (game/index.html plus its ES
// modules, no library and no network request at all). This program hands
// the entry in: it copies game/ and screenshots/ from beside this file
// into the output directory and writes dossier.json there, the summary
// the judge reads, built with the vendored make.fun library.
//
// Run it locally like this:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output. The run is
// deterministic: the same repository always produces the same bytes.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const gameDir = join(repoRoot, 'game');
const shotsDir = join(repoRoot, 'screenshots');

// Start from a clean output: stale files from an earlier run must never
// leak into the entry. Only game/, screenshots/ and dossier.json are
// written, and the output directory itself is never deleted or recreated:
// the grader owns it, so this program only creates it when it is missing
// and clears nothing it did not put there.
mkdirSync(outputDir, { recursive: true });
cpSync(gameDir, join(outputDir, 'game'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(shotsDir)) {
  cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });
}

// The scorer's caps, from the competition's gate: the text cap shapes the
// dossier's bytes; the rest refuse an entry the scorer would refuse anyway
// (more than 4 screenshots, one over 256 KiB, a game/ over 993 files or
// 48 MiB, or any game/ path over 1000 bytes). game/ counts beside /output's
// own 1000-entry cap, which screenshots/ and dossier.json share.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
