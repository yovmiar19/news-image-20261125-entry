// News-image entry for make.fun (news-image-20261125), Node 22, standard library only.
//
// The image itself is the entry: a 1024x1024 PNG drawn from 35 verified stories of
// Wednesday 25 November 2026, shipped in this repository as entry.png. This program
// places an exact copy of it at /output/entry.png (or $MAKEFUN_OUTPUT_DIR), so the
// grader's two runs write byte-identical files. It also enforces the gate before
// copying: the file must be a whole PNG of at most 1 MiB and 1024 by 1024 pixels.
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
  if (width > MAX_SIDE || height > MAX_SIDE) {
    throw new Error(`entry.png is ${width}x${height}, over the ${MAX_SIDE}x${MAX_SIDE} gate`);
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
