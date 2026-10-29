#!/usr/bin/env node
// anydeals outbound tracker - zero dependencies, one JSON file as the database.
// Run:   node server.mjs [--port 8789] [--data prospects-data.json]
// Open:  http://localhost:8789
//
// API (for the agent that runs the campaign):
//   GET    /api/prospects            list all prospects
//   POST   /api/prospects            add one  {name, channel?, handle?, status?, notes?, draft?}
//   POST   /api/prospects/bulk       import many  {prospects:[...]} - dedupes on name+handle
//   PATCH  /api/prospects/<id>       update any fields (status, next, notes, draft, ...)
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
const CHANNELS = ["Instagram", "Email", "WhatsApp", "LinkedIn", "Other"];
const MAX_BODY = 2 * 1024 * 1024; // 2 MB
const today = () => new Date().toISOString().slice(0, 10);

// AD-5: an unparseable data file must never become an empty database.
// Quarantine it under a new name and fail loudly instead - this file holds
// the live campaign.
const readData = () => {
  try {
    const d = JSON.parse(fs.readFileSync(DATA, "utf8"));
    return Array.isArray(d) ? d : [];
  } catch (e) {
    if (fs.existsSync(DATA)) {
      const quarantine = `${DATA}.corrupt-${Date.now()}`;
      fs.renameSync(DATA, quarantine);
      throw new Error(`prospects-data.json was unreadable and has been moved to ${path.basename(quarantine)}. Fix or delete it, then restart. (${e.message})`);
    }
    return [];
  }
};
const writeData = d => {
  const tmp = DATA + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(d, null, 2));
  fs.renameSync(tmp, DATA);
};

// AD-7: mutations only from the machine's own origin.
const sameOrigin = req => {
  const host = req.headers.host || "";
  const okHost = host === `localhost:${PORT}` || host === `127.0.0.1:${PORT}`;
  const origin = req.headers.origin;
  if (origin && !/^https?:\/\/(localhost|127\.0\.0\.1):(\d+)$/.test(origin)) return false;
  return okHost;
};

// AD-8: serialize every read-modify-write so concurrent requests
// (agent bulk-post during a human edit) cannot lose updates.
let writeTail = Promise.resolve();
const serialized = fn => {
  const run = writeTail.then(fn);
  writeTail = run.catch(() => {});
  return run;
};

const oneOf = (v, list) => (list.includes(v) ? v : "");
const cap = (v, n) => (typeof v === "string" ? v.slice(0, n) : "");
const normalize = a => ({
  id: a.id || crypto.randomUUID().slice(0, 8),
  name: (a.name || "").trim().slice(0, 160),
  channel: oneOf(a.channel, CHANNELS),             // AD-10: validated
  handle: (a.handle || "").trim().slice(0, 160),
  draft: cap(a.draft, 4000),                        // AD-6: drafts are first-class
  status: STATUSES.includes(a.status) ? a.status : "Found",
  date_contacted: cap(a.date_contacted, 10),
  next: cap(a.next, 200),
  notes: cap(a.notes, 4000),
  updated: a.updated || today()
});
const applyPatch = (record, patch) => {
  const next = { ...record };
  if ("name" in patch) next.name = (patch.name || "").trim().slice(0, 160);
  if ("channel" in patch) next.channel = oneOf(patch.channel, CHANNELS);
  if ("handle" in patch) next.handle = (patch.handle || "").trim().slice(0, 160);
  if ("draft" in patch) next.draft = cap(patch.draft, 4000);
  if ("status" in patch) next.status = STATUSES.includes(patch.status) ? patch.status : record.status;
  if ("date_contacted" in patch) next.date_contacted = cap(patch.date_contacted, 10);
  if ("next" in patch) next.next = cap(patch.next, 200);
  if ("notes" in patch) next.notes = cap(patch.notes, 4000);
  next.updated = today();
  return next;
};

async function readBody(req) {
  let body = "", size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw new Error("request body too large");
    body += chunk;
  }
  try { return JSON.parse(body || "{}"); } catch { return {}; }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const send = (code, payload, type = "application/json") => {
    res.writeHead(code, { "content-type": type + "; charset=utf-8" });
    res.end(typeof payload === "string" || Buffer.isBuffer(payload) ? payload : JSON.stringify(payload, null, 2));
  };
  const mutating = ["POST", "PATCH", "DELETE"].includes(req.method);
  try {
    if (mutating && !sameOrigin(req)) return send(403, { error: "cross-origin requests are not allowed" });

    if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html"))
      return send(200, fs.readFileSync(path.join(here, "index.html"), "utf8"), "text/html");

    if (url.pathname === "/api/prospects" && req.method === "GET") return send(200, readData());

    if (url.pathname === "/api/prospects" && req.method === "POST") {
      const body = await readBody(req);
      return serialized(() => {
        const p = normalize(body);
        if (!p.name) return send(400, { error: "name is required" });
        const d = readData(); d.push(p); writeData(d);
        send(201, p);
      });
    }

    if (url.pathname === "/api/prospects/bulk" && req.method === "POST") {
      const body = await readBody(req);
      if (!Array.isArray(body.prospects)) return send(400, { error: "body must be {prospects:[...]}" });
      return serialized(() => {
        const d = readData();
        const seen = new Set(d.map(a => (a.name + "|" + a.handle).toLowerCase()));
        const added = [];
        for (const item of body.prospects) {
          const p = normalize(item);
          if (!p.name || seen.has((p.name + "|" + p.handle).toLowerCase())) continue;
          seen.add((p.name + "|" + p.handle).toLowerCase());
          d.push(p); added.push(p);
        }
        writeData(d);
        send(200, { added: added.length, prospects: added });
      });
    }

    const m = url.pathname.match(/^\/api\/prospects\/([\w-]+)$/);
    if (m) {
      const body = req.method === "PATCH" ? await readBody(req) : {};
      return serialized(() => {
        const d = readData();
        const i = d.findIndex(a => a.id === m[1]);
        if (i < 0) return send(404, { error: "not found" });
        if (req.method === "PATCH") {
          d[i] = applyPatch(d[i], body);
          writeData(d);
          return send(200, d[i]);
        }
        if (req.method === "DELETE") { const [rm] = d.splice(i, 1); writeData(d); return send(200, rm); }
      });
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
