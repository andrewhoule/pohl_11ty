import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";

const cssReloadFile = path.join(os.tmpdir(), "pohl_11ty-css-reload.txt");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

fs.writeFileSync(cssReloadFile, `${Date.now()}\n`);

const css = spawn(npmCommand, ["run", "css:watch"], {
  shell: process.platform === "win32",
  stdio: ["inherit", "pipe", "pipe"]
});

const server = spawn("eleventy", ["--serve"], {
  shell: process.platform === "win32",
  stdio: ["inherit", "pipe", "pipe"]
});

let opened = false;

function openBrowser(url) {
  const command =
    process.platform === "darwin"
      ? "open"
      : process.platform === "win32"
        ? "cmd"
        : "xdg-open";
  const args =
    process.platform === "win32"
      ? ["/c", "start", "", url]
      : [url];

  const opener = spawn(command, args, {
    detached: true,
    stdio: "ignore"
  });

  opener.on("error", () => {
    process.stderr.write(`Could not open browser automatically. Visit ${url}\n`);
  });
  opener.unref();
}

function handleOutput(stream, chunk) {
  const text = chunk.toString();
  stream.write(text);

  if (opened) {
    return;
  }

  const match = text.match(/https?:\/\/(?:localhost|127\.0\.0\.1):\d+\//);
  if (match) {
    opened = true;
    openBrowser(match[0]);
  }
}

server.stdout.on("data", (chunk) => handleOutput(process.stdout, chunk));
server.stderr.on("data", (chunk) => handleOutput(process.stderr, chunk));
css.stdout.on("data", (chunk) => process.stdout.write(chunk));
css.stderr.on("data", (chunk) => process.stderr.write(chunk));

function stopProcesses(signal) {
  for (const child of [css, server]) {
    if (!child.killed) {
      child.kill(signal);
    }
  }
}

server.on("exit", (code, signal) => {
  if (signal) {
    stopProcesses(signal);
    process.exit(0);
    return;
  }

  stopProcesses("SIGTERM");
  process.exit(code ?? 0);
});

server.on("error", (error) => {
  process.stderr.write(`${error.message}\n`);
  stopProcesses("SIGTERM");
  process.exit(1);
});

css.on("exit", (code, signal) => {
  if (signal) {
    return;
  }

  if (code && code !== 0) {
    stopProcesses("SIGTERM");
    process.exit(code);
  }
});

css.on("error", (error) => {
  process.stderr.write(`${error.message}\n`);
  stopProcesses("SIGTERM");
  process.exit(1);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    stopProcesses(signal);
  });
}
