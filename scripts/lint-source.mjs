import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
let ts;
try { ts = require("typescript"); }
catch { ts = require("/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js"); }

const roots = ["app", "lib"];
const extensions = new Set([".ts", ".tsx"]);
const files = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (extensions.has(path.extname(entry.name)) && !entry.name.endsWith(".d.ts")) files.push(full);
  }
}
for (const root of roots) walk(root);
let failures = 0;
for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const diagnostics = source.parseDiagnostics || [];
  if (diagnostics.length) {
    failures += diagnostics.length;
    for (const d of diagnostics) {
      const pos = source.getLineAndCharacterOfPosition(d.start || 0);
      console.error(`FAIL ${file}:${pos.line + 1}:${pos.character + 1} ${ts.flattenDiagnosticMessageText(d.messageText, " ")}`);
    }
  }
}
if (failures) {
  console.error(`SOURCE LINT: ${failures} syntax error(s) across ${files.length} files`);
  process.exit(1);
}
console.log(`SOURCE LINT: ${files.length} TypeScript/TSX files parsed with no syntax errors. Run npm run build for semantic type checking.`);
