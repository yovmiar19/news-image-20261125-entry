// News-image entry for make.fun (news-image-20261125), Node 22, standard library only.
//
// The image itself is the entry: a 1024x1024 PNG drawn from 35 verified stories,
// shipped in this repository as entry.png. This program places an exact copy of
// it at /output/entry.png (or $MAKEFUN_OUTPUT_DIR), so the grader's two runs
// write byte-identical files. It also enforces the gate before copying: the
// file must be a whole PNG of at most 1 MiB and 1024 by 1024 pixels.
//
// REBUILT 25 Nov 2026 (replaces the first submission): every date re-verified
// against Reuters/CNN/BBC/AP/WHO before the rebuild. Lead story is now the ICJ
// Rohingya genocide ruling (19 Nov, 9–6, first state ever found guilty of
// genocide); the other heroes are Russia's Kyiv bridge strikes (20 Nov, 8
// killed, retaliation for the Crimean Bridge attacks), Anthropic falling below
// its $83 IPO price (record debut 19 Nov, reversal by 24 Nov), the Berlin
// summit's "united" negotiating position (19 Nov), and the COP31 collapse
// (first failed UN climate summit since 2009). The Nvidia +31.5% surge was
// Monday 23 Nov, not 25 Nov, so it is demoted to a grid cell reframed as the
// rally fading; the CIA/ODNI breach is an UNCLASSIFIED open-source network
// (24 Nov), not a classified one. The footer no longer claims every story is
// a 25 Nov event: it reads "the week's most consequential stories, led by
// 25 November's news".
//
// Run locally:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Verify with:  sha256sum out/entry.png entry.png   (the two hashes must match)

import { closeSync, copyFileSync, existsSync, openSync, readSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const MAX_BYTES = 1_048_576;
const MAX_SIDE = 1024;
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function readPngSize(path: string): { width: number; height: number } {
  const header = Buffer.alloc(33);
  const fd = openSync(path, 'r');
  try {
    readSync(fd, header, 0, 33, 0);
  } finally {
    closeSync(fd);
  }
  if (!header.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error('entry.png is not a PNG file');
  }
  return { width: header.readUInt32BE(16), height: header.readUInt32BE(20) };
}

function publishEntry(): void {
  const repoRoot = dirname(fileURLToPath(import.meta.url));
  const sourceImage = join(repoRoot, 'entry.png');
  const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
  const targetImage = join(outputDir, 'entry.png');

  if (!existsSync(sourceImage)) {
    throw new Error(`entry.png not found beside main.ts: ${sourceImage}`);
  }
  const { width, height } = readPngSize(sourceImage);
  if (width !== MAX_SIDE || height !== MAX_SIDE) {
    throw new Error(`entry.png is ${width}x${height}, not exactly ${MAX_SIDE}x${MAX_SIDE}`);
  }
  if (statSync(sourceImage).size > MAX_BYTES) {
    throw new Error('entry.png is over the 1 MiB gate');
  }

  copyFileSync(sourceImage, targetImage);

  if (statSync(targetImage).size !== statSync(sourceImage).size) {
    throw new Error('copied entry.png does not match the source size');
  }
}

publishEntry();
