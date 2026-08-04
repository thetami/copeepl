#!/usr/bin/env node
// Runs `next dev` alongside a tiny SSE server that watches src/ and tells
// the browser to hard-reload on every save, bypassing Fast Refresh's HMR.
import { spawn } from "node:child_process";
import { watch } from "node:fs";
import http from "node:http";
import path from "node:path";

const PORT = Number(process.env.HARD_RELOAD_PORT) || 47820;
const WATCH_DIR = path.join(process.cwd(), "src");

const clients = new Set();

const server = http.createServer((req, res) => {
  if (req.url !== "/hard-reload") {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });
  res.write("\n");
  clients.add(res);
  req.on("close", () => clients.delete(res));
});

server.listen(PORT, () => {
  console.log(`[hard-reload] watching ${WATCH_DIR} on :${PORT}`);
});

let debounce;
watch(WATCH_DIR, { recursive: true }, () => {
  clearTimeout(debounce);
  debounce = setTimeout(() => {
    for (const client of clients) client.write("data: reload\n\n");
  }, 150);
});

const next = spawn("next", ["dev"], { stdio: "inherit", shell: true });
next.on("exit", (code) => {
  server.close();
  process.exit(code ?? 0);
});
