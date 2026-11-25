// Sizzle & Serve — the hand-in program for the "Make the best cooking game"
// bounty. It runs on plain Node 22 with nothing but the standard library.

// What it does, in three steps:
//   1. Takes the finished game (the static files in game/) and the four
//      play-test screenshots (screenshots/) that sit next to this file.
//   2. Puts copies of both into the output folder the grader provides
//      (or MAKEFUN_OUTPUT_DIR when running locally, for a dry run).
//   3. Writes dossier.json there, a summary of the handed-in files made by
//      the vendored make.fun helper, so the judge can check the entry
//      without opening every file.

// The game itself needs no build step and no network: a desktop browser
// opens game/index.html and plays it straight from disk. Running this
// program twice over the same repository always writes the same bytes.

// Local dry run (from this folder):
//   MAKEFUN_OUTPUT_DIR=out node main.ts   — after mkdir -p out

import * as fs from 'node:fs';
import * as path from 'node:path';
import { buildDossier as makeDossier } from './vendor/makefun-game.ts';

// The folder this file lives in, and the folder the entry goes to.
const repoDir = import.meta.dirname;
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The caps the scorer applies to the handed-in tree, as named limits so
// each number says what it bounds. Only the text cap changes the
// dossier's bytes; the rest are limits that refuse an entry the scorer
// would refuse anyway, so this program fails the same way instead of
// handing in something doomed: at most four screenshots, each at most
// 256 KiB; game/ at most 993 files and 48 MiB in total, with no path
// longer than 1000 bytes.
const TEXT_CAP_BYTES = 160 * 1024;
const SHOT_COUNT_CAP = 4;
const SHOT_SIZE_CAP_BYTES = 256 * 1024;
const GAME_FILE_CAP = 993;
const GAME_SIZE_CAP_BYTES = 48 * 1024 * 1024;
const GAME_PATH_CAP_BYTES = 1000;

const gateCaps = {
  text_max_bytes: TEXT_CAP_BYTES,
  screenshots: { max: SHOT_COUNT_CAP, max_bytes: SHOT_SIZE_CAP_BYTES },
  game_max_files: GAME_FILE_CAP,
  game_max_bytes: GAME_SIZE_CAP_BYTES,
  game_path_max_bytes: GAME_PATH_CAP_BYTES,
};

// Hand the entry in: make the output folder, copy game/ and screenshots/
// beside this file into it (a missing screenshots/ folder is skipped
// quietly, though this entry always ships four pictures), then write the
// dossier the scorer reads.
fs.mkdirSync(outDir, { recursive: true });
['game', 'screenshots']
  .map((folder) => path.join(repoDir, folder))
  .filter((src) => fs.existsSync(src))
  .forEach((src) => fs.cpSync(src, path.join(outDir, path.basename(src)), { recursive: true }));

fs.writeFileSync(path.join(outDir, 'dossier.json'), makeDossier(outDir, gateCaps));
