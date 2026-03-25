const fs = require("fs/promises");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "docs");

const FILES = [
  "index.html",
  "styles.css",
  "game.js",
  "story.js",
  "characters.js",
  "player_name.js",
  "credits.html",
  "credits.css",
  "credits.js"
];

const DIRS = [
  "assets"
];

async function exists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function cleanDir(target) {
  if (await exists(target)) {
    await fs.rm(target, { recursive: true, force: true });
  }
  await fs.mkdir(target, { recursive: true });
}

async function copyFile(src, dest) {
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.copyFile(src, dest);
}

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === ".DS_Store") {
      continue;
    }
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(from, to);
    } else {
      await copyFile(from, to);
    }
  }
}

async function build() {
  await cleanDir(OUT_DIR);

  for (const file of FILES) {
    const src = path.join(ROOT, file);
    if (await exists(src)) {
      await copyFile(src, path.join(OUT_DIR, file));
    }
  }

  for (const dir of DIRS) {
    const src = path.join(ROOT, dir);
    if (await exists(src)) {
      await copyDir(src, path.join(OUT_DIR, dir));
    }
  }

  await copyFile(path.join(ROOT, "index.html"), path.join(OUT_DIR, "404.html"));

  await fs.writeFile(path.join(OUT_DIR, ".nojekyll"), "");
  console.log("Web build готов: " + OUT_DIR);
}

build().catch((err) => {
  console.error("Web build failed:", err);
  process.exit(1);
});
