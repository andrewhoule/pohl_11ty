import fs from "node:fs/promises";
import { watch } from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import postcss from "postcss";
import postcssImport from "postcss-import";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";

const input = "assets/css/main.css";
const output = "dist/assets/css/app.css";
const servedOutput = "_site/assets/css/app.css";
const watchDir = "assets/css";
const reloadFile = path.join(os.tmpdir(), "pohl_11ty-css-reload.txt");
const isWatch = process.argv.includes("--watch");

async function buildCss() {
  const css = await fs.readFile(input, "utf8");
  const result = await postcss([
    postcssImport(),
    autoprefixer(),
    cssnano({ preset: "default" })
  ]).process(css, {
    from: input,
    to: output,
    map: {
      annotation: "app.css.map",
      inline: false,
      sourcesContent: true
    }
  });

  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, result.css);

  if (result.map) {
    await fs.writeFile(`${output}.map`, result.map.toString());
  }

  if (isWatch) {
    await fs.mkdir(path.dirname(servedOutput), { recursive: true });
    await fs.writeFile(servedOutput, result.css);

    if (result.map) {
      await fs.writeFile(`${servedOutput}.map`, result.map.toString());
    }

    await fs.writeFile(reloadFile, `${Date.now()}\n`);
  }
}

async function runBuild() {
  try {
    await buildCss();
    process.stdout.write(`Built ${output}\n`);
  } catch (error) {
    process.stderr.write(`${error.stack || error.message}\n`);
    if (!isWatch) {
      process.exit(1);
    }
  }
}

await runBuild();

if (isWatch) {
  let timeout;

  watch(watchDir, (eventType, filename) => {
    if (!filename || !filename.endsWith(".css")) {
      return;
    }

    clearTimeout(timeout);
    timeout = setTimeout(runBuild, 100);
  });
}
