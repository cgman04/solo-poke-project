// Downloads shiny animated sprites (GIFs) for Pokemon 1-649 from PokeAPI sprites repo
// Usage: node downloadShinyAnimatedSprites.js

import fs from 'fs';
import path from 'path';
import https from 'https';

const OUTPUT_DIR = 'public/sprites/pokemon/animated/shiny';
const BASE_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/shiny';

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => { file.close(); resolve(true); });
      } else {
        file.close();
        fs.unlinkSync(dest);
        resolve(false);
      }
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      resolve(false);
    });
  });
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let success = 0;
  let fail = 0;

  for (let id = 1; id <= 649; id++) {
    const url = `${BASE_URL}/${id}.gif`;
    const dest = path.join(OUTPUT_DIR, `${id}.gif`);

    if (fs.existsSync(dest)) {
      console.log(`[SKIP] ${id}.gif already exists`);
      success++;
      continue;
    }

    const ok = await download(url, dest);
    if (ok) {
      success++;
      if (success % 50 === 0) console.log(`Downloaded ${success} shiny sprites...`);
    } else {
      fail++;
      console.log(`[FAIL] ${id}.gif`);
    }
  }

  console.log(`Done! ${success} downloaded, ${fail} failed.`);
}

main();
