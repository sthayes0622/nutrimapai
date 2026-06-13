// Copies public/ and .next/static/ into .next/standalone so the server can serve them
const fs = require("fs");
const path = require("path");

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

const root = path.join(__dirname, "..");
const standalone = path.join(root, ".next/standalone");

// Copy .next/static → .next/standalone/.next/static
copyDir(
  path.join(root, ".next/static"),
  path.join(standalone, ".next/static")
);

// Copy public/ → .next/standalone/public
copyDir(
  path.join(root, "public"),
  path.join(standalone, "public")
);

console.log("Static files copied into .next/standalone");
