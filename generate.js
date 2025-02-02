import { promisify } from "util";
import path from "path";
import hljs from "highlight.js";
import fs from "fs";
import hljsDefineAss from "./src/languages/ass.js";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

hljs.registerLanguage("ass", hljsDefineAss);
hljs.debugMode();

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

async function generateSyntaxHighlightingSamples() {
  const files = (
    await readdir(path.join(__dirname, "test", "markup", "ass"))
  ).filter(
    (f) => !f.includes(".expect.") && (f.endsWith(".ass") || f.endsWith(".ssa"))
  );
  for (const file of files) {
    const filePath = path.join(__dirname, "test", "markup", "ass", file);
    const expectedFilePath = filePath.replace(/\.(ass|ssa)$/, ".expect.html");
    // get rid of byte order mark
    const code = (await readFile(filePath, "utf-8")).trimStart();
    const result = hljs.highlight(code, {
      language: "ass",
    });
    const actual = result.value;
    await writeFile(expectedFilePath, actual);
  }
}

await generateSyntaxHighlightingSamples();
