import { promisify } from "util";
import path from "path";
import hljs from "highlight.js";
import fs from "fs";
import hljsDefineAss from "../src/languages/ass.js";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

hljs.registerLanguage("ass", hljsDefineAss);

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

async function generateSyntaxHighlightingSamples() {
  hljs.registerLanguage("ass", hljsDefineAss);

  const files = (await readdir(path.join(__dirname, "markup"))).filter(
    (f) => !f.includes(".expect.")
  );
  for (const file of files) {
    const filePath = path.join(__dirname, "markup", file);
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
