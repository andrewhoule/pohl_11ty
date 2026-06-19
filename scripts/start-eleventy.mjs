import { spawn } from "node:child_process";
import process from "node:process";

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

server.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});

server.on("error", (error) => {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    if (!server.killed) {
      server.kill(signal);
    }
  });
}
