const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const PORT = 3000;
const baseDir = path.resolve(__dirname);
const dataPath = path.join(baseDir, "data", "notes.json");

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  if (pathname === "/" || pathname.startsWith("/public/")) {
    let filePath;
    if (pathname === "/") {
      filePath = path.join(baseDir, "public", "index.html");
    } else {
      const resolved = path.resolve(baseDir, "." + pathname);
      const baseResolved = path.resolve(baseDir) + path.sep;
      if (
        !(
          resolved === path.resolve(baseDir) ||
          resolved.startsWith(baseResolved)
        )
      ) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }
      filePath = resolved;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("File not found");
        return;
      }

      const ext = path.extname(filePath);
      const mime = {
        ".html": "text/html",
        ".css": "text/css",
        ".js": "application/javascript",
      }[ext];

      res.writeHead(200, { "Content-Type": mime || "text/plain" });
      res.end(data);
    });
    return;
  }

  if (pathname === "/api/notes" && req.method === "GET") {
    fs.readFile(dataPath, "utf8", (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: "Cannot read notes" }));
        return;
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(data);
    });
  } else if (pathname === "/api/notes" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const newNote = JSON.parse(body);
      fs.readFile(dataPath, "utf8", (err, data) => {
        const notes = JSON.parse(data || "[]");
        newNote.id = Date.now();
        notes.push(newNote);
        fs.writeFile(dataPath, JSON.stringify(notes, null, 2), () => {
          res.writeHead(201, { "Content-Type": "application/json" });
          res.end(JSON.stringify(newNote));
        });
      });
    });
  } else if (pathname.startsWith("/api/notes/") && req.method === "DELETE") {
    const parts = pathname.split("/").filter(Boolean);
    const idStr = parts[parts.length - 1];
    const id = parseInt(idStr, 10);
    if (Number.isNaN(id)) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: "Invalid id" }));
      return;
    }

    fs.readFile(dataPath, "utf8", (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: "Cannot read notes" }));
        return;
      }
      let notes = [];
      try {
        notes = JSON.parse(data || "[]");
      } catch (e) {
        notes = [];
      }

      const originalLength = notes.length;
      notes = notes.filter((n) => Number(n.id) !== id);

      if (notes.length === originalLength) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: "Note not found" }));
        return;
      }

      fs.writeFile(dataPath, JSON.stringify(notes, null, 2), (writeErr) => {
        if (writeErr) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: "Cannot delete note" }));
          return;
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true }));
      });
    });
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

server.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
