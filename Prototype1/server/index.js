import express from "express";
import cors from "cors";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import multer from "multer";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pub = path.join(__dirname, "public");
const uploads = path.join(pub, "uploads");
if (!fs.existsSync(pub)) fs.mkdirSync(pub);
if (!fs.existsSync(uploads)) fs.mkdirSync(uploads);

const db = new Database(path.join(__dirname, "app.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.exec(`
CREATE TABLE IF NOT EXISTS images(
  id INTEGER PRIMARY KEY,
  url TEXT NOT NULL,
  name TEXT,
  category TEXT,
  tags TEXT,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS meta(
  key TEXT PRIMARY KEY,
  value TEXT
);
CREATE TABLE IF NOT EXISTS news(
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT,
  cover_url TEXT,
  body TEXT NOT NULL,
  category TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_news_created_at ON news(created_at DESC);
`);
const imgCols = db.prepare("PRAGMA table_info(images)").all().map(r=>r.name);
if (!imgCols.includes("name")) db.exec("ALTER TABLE images ADD COLUMN name TEXT");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use("/static", express.static(pub));

function parseTags(t){ if(t==null||t==="") return []; try{ const v=JSON.parse(t); return Array.isArray(v)?v:[String(v)]; }catch(e){ return [String(t)]; } }
function toTagsText(v){ if(v==null) return null; if(Array.isArray(v)) return JSON.stringify(v); return JSON.stringify([v]); }

function getMetaPair(key, defVal){
    const row = db.prepare("SELECT value FROM meta WHERE key=?").get(key);
    if (!row || row.value == null) return defVal;
    try { return JSON.parse(row.value); } catch { return defVal; }
}
function setMetaPair(key, val){
    const value = JSON.stringify(val ?? null);
    db.prepare("INSERT INTO meta(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(key, value);
}

const clients = new Set();
function sseBroadcast(event, data){
    const payload = `event: ${event}\ndata: ${JSON.stringify(data || {})}\n\n`;
    for (const res of clients) { try { res.write(payload); } catch(e){} }
}

app.get("/api/events",(req,res)=>{
    res.setHeader("Content-Type","text/event-stream");
    res.setHeader("Cache-Control","no-cache");
    res.setHeader("Connection","keep-alive");
    res.flushHeaders?.();
    res.write(`event: ping\ndata: {}\n\n`);
    clients.add(res);
    const timer = setInterval(()=>{ try{ res.write(`event: ping\ndata: {}\n\n`);}catch(e){} }, 25000);
    req.on("close",()=>{ clearInterval(timer); clients.delete(res); });
});

app.get("/api/images",(req,res)=>{
    const rows = db.prepare("SELECT id,url,name,category,tags,created_at FROM images ORDER BY created_at DESC").all();
    res.json(rows.map(r=>({ ...r, tags: parseTags(r.tags) })));
});

app.post("/api/admin/images",(req,res)=>{
    const { url, name, category, tags } = req.body;
    const info=db.prepare("INSERT INTO images(url,name,category,tags,created_at) VALUES(?,?,?,?,?)")
        .run(url, name??null, category??null, toTagsText(tags), Date.now());
    sseBroadcast("images",{action:"created", id: info.lastInsertRowid});
    res.json({ id: info.lastInsertRowid });
});

app.patch("/api/admin/images/:id",(req,res)=>{
    const row=db.prepare("SELECT * FROM images WHERE id=?").get(req.params.id);
    if(!row) return res.status(404).end();
    const url=req.body.url??row.url;
    const name=req.body.hasOwnProperty("name")?req.body.name:row.name;
    const category=req.body.category??row.category;
    const tags=req.body.hasOwnProperty("tags")?toTagsText(req.body.tags):row.tags;
    db.prepare("UPDATE images SET url=?,name=?,category=?,tags=? WHERE id=?").run(url,name,category,tags,req.params.id);
    sseBroadcast("images",{action:"updated", id: Number(req.params.id)});
    res.json({ ok:true });
});

app.delete("/api/admin/images/:id",(req,res)=>{
    const row=db.prepare("SELECT * FROM images WHERE id=?").get(req.params.id);
    if(row && row.url && row.url.startsWith("/static/")){
        const diskPath = path.join(pub, row.url.replace(/^\/static\//,""));
        try { if (fs.existsSync(diskPath)) fs.unlinkSync(diskPath); } catch(e){}
    }
    db.prepare("DELETE FROM images WHERE id=?").run(req.params.id);
    sseBroadcast("images",{action:"deleted", id: Number(req.params.id)});
    res.json({ ok:true });
});

app.get("/api/meta",(req,res)=>{
    const categories = getMetaPair("categories", []);
    const tags = getMetaPair("tags", []);
    res.json({ categories, tags });
});

app.patch("/api/admin/meta",(req,res)=>{
    const categories = Array.isArray(req.body.categories) ? Array.from(new Set(req.body.categories)) : [];
    const tags = Array.isArray(req.body.tags) ? Array.from(new Set(req.body.tags)).slice(0,5) : [];
    setMetaPair("categories", categories);
    setMetaPair("tags", tags);
    sseBroadcast("meta",{action:"updated"});
    res.json({ ok:true });
});

function safeName(original){
    const ext = (path.extname(original||"").toLowerCase()) || ".jpg";
    const baseRaw = path.basename(original||"image", path.extname(original||"image"));
    let base = baseRaw.replace(/[^\w\-]+/g,"-").replace(/-+/g,"-").replace(/^[-_\.]+|[-_\.]+$/g,"").toLowerCase();
    if (!base) base = "image";
    let candidate = `${base}${ext}`;
    let i = 0;
    while (fs.existsSync(path.join(uploads, candidate))) { i += 1; candidate = `${base}-${i}${ext}`; }
    return candidate;
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, uploads); },
    filename: function (req, file, cb) { cb(null, safeName(file.originalname || "image.jpg")); }
});
const upload = multer({ storage });

app.post("/api/admin/upload", upload.single("file"), (req,res)=>{
    if(!req.file) return res.status(400).end();
    const url = "/static/uploads/"+req.file.filename;
    res.json({ url, name: req.file.originalname });
});

app.get("/api/news",(req,res)=>{
    const rows=db.prepare("SELECT id,title,excerpt,cover_url,body,category,created_at,updated_at FROM news ORDER BY created_at DESC").all();
    res.json(rows);
});

app.get("/api/news/:id",(req,res)=>{
    const row=db.prepare("SELECT id,title,excerpt,cover_url,body,category,created_at,updated_at FROM news WHERE id=?").get(req.params.id);
    if(!row) return res.status(404).end();
    res.json(row);
});

app.post("/api/admin/news",(req,res)=>{
    const { title, excerpt, cover_url, body, category }=req.body||{};
    if(!title||!body) return res.status(400).end();
    const info=db.prepare("INSERT INTO news(title,excerpt,cover_url,body,category,created_at) VALUES(?,?,?,?,?,?)").run(title,excerpt??null,cover_url??null,body,category??null,Date.now());
    sseBroadcast("news",{action:"created", id: info.lastInsertRowid});
    res.json({ id: info.lastInsertRowid });
});

app.patch("/api/admin/news/:id",(req,res)=>{
    const row=db.prepare("SELECT * FROM news WHERE id=?").get(req.params.id);
    if(!row) return res.status(404).end();
    const title=req.body.title??row.title;
    const excerpt=req.body.excerpt??row.excerpt;
    const cover_url=req.body.cover_url??row.cover_url;
    const body=req.body.body??row.body;
    const category=req.body.category??row.category;
    db.prepare("UPDATE news SET title=?,excerpt=?,cover_url=?,body=?,category=?,updated_at=? WHERE id=?").run(title,excerpt,cover_url,body,category,Date.now(),req.params.id);
    sseBroadcast("news",{action:"updated", id: Number(req.params.id)});
    res.json({ ok:true });
});

app.delete("/api/admin/news/:id",(req,res)=>{
    db.prepare("DELETE FROM news WHERE id=?").run(req.params.id);
    sseBroadcast("news",{action:"deleted", id: Number(req.params.id)});
    res.json({ ok:true });
});

app.listen(5174);
