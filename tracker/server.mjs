#!/usr/bin/env node
// anydeals outbound tracker - zero dependencies, one JSON file as the database.
// Run:   node server.mjs [--port 8789] [--data prospects-data.json]
// Open:  http://localhost:8789
//
// API (for the agent that runs the campaign):
//   GET    /api/prospects            list all prospects
//   POST   /api/prospects            add one  {name, channel?, handle?, status?, notes?, next?}
//   POST   /api/prospects/bulk       import many  {prospects:[...]} - dedupes on name+handle
//   PATCH  /api/prospects/<id>       update any fields (status, next, notes, ...)
//   DELETE /api/prospects/<id>       remove
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const arg = (name, fallback) => { const i = argv.indexOf(name); return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback; };
const PORT = Number(arg("--port", "8789"));
const DATA = path.resolve(arg("--data", path.join(process.cwd(), "prospects-data.json")));
const STATUSES = ["Found", "Drafted", "Approved", "Contacted", "Follow-up sent", "Replied", "Meeting", "Won", "Lost"];
const today = () => new Date().toISOString().slice(0, 10);

const readData = () => { try { const d = JSON.parse(fs.readFileSync(DATA, "utf8")); return Array.isArray(d) ? d : []; } catch { return []; } };
const writeData = d => {
  const tmp = DATA + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(d, null, 2));
  fs.renameSync(tmp, DATA);
};
const normalize = a => ({
  id: a.id || crypto.randomUUID().slice(0, 8),
  name: (a.name || "").trim(),
  channel: a.channel || "",
  handle: (a.handle || "").trim(),
  status: STATUSES.includes(a.status) ? a.status : "Found",
  date_contacted: a.date_contacted || "",
  next: a.next || "",
  notes: a.notes || "",
  updated: a.updated || today()
});

async function readBody(req) {
  let body = "";
  for await (const chunk of req) body += chunk;
  try { return JSON.parse(body || "{}"); } catch { return {}; }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const send = (code, payload, type = "application/json") => {
    res.writeHead(code, { "content-type": type + "; charset=utf-8" });
    res.end(typeof payload === "string" || Buffer.isBuffer(payload) ? payload : JSON.stringify(payload, null, 2));
  };
  try {
    if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html"))
      return send(200, fs.readFileSync(path.join(here, "index.html"), "utf8"), "text/html");

    if (url.pathname === "/api/prospects" && req.method === "GET") return send(200, readData());

    if (url.pathname === "/api/prospects" && req.method === "POST") {
      const p = normalize(await readBody(req));
      if (!p.name) return send(400, { error: "name is required" });
      const d = readData(); d.push(p); writeData(d);
      return send(201, p);
    }

    if (url.pathname === "/api/prospects/bulk" && req.method === "POST") {
      const { prospects } = await readBody(req);
      if (!Array.isArray(prospects)) return send(400, { error: "body must be {prospects:[...]}" });
      const d = readData();
      const seen = new Set(d.map(a => (a.name + "|" + a.handle).toLowerCase()));
      const added = [];
      for (const item of prospects) {
        const p = normalize(item);
        if (!p.name || seen.has((p.name + "|" + p.handle).toLowerCase())) continue;
        seen.add((p.name + "|" + p.handle).toLowerCase());
        d.push(p); added.push(p);
      }
      writeData(d);
      return send(200, { added: added.length, prospects: added });
    }

    const m = url.pathname.match(/^\/api\/prospects\/([\w-]+)$/);
    if (m) {
      const d = readData();
      const i = d.findIndex(a => a.id === m[1]);
      if (i < 0) return send(404, { error: "not found" });
      if (req.method === "PATCH") {
        const patch = await readBody(req);
        d[i] = { ...d[i], ...patch, id: d[i].id, updated: today() };
        if (!STATUSES.includes(d[i].status)) d[i].status = "Found";
        writeData(d);
        return send(200, d[i]);
      }
      if (req.method === "DELETE") { const [rm] = d.splice(i, 1); writeData(d); return send(200, rm); }
    }
    send(404, { error: "not found" });
  } catch (e) {
    send(500, { error: String(e.message || e) });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`anydeals outbound tracker  ->  http://localhost:${PORT}`);
  console.log(`data file                  ->  ${DATA}`);
});
