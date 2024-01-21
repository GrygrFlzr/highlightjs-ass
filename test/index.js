import "should";
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

describe("ASS syntax highlighting", () => {
  async function itShouldPerformSyntaxHighlighting() {
    hljs.registerLanguage("ass", hljsDefineAss);

    const files = (await readdir(path.join(__dirname, "markup"))).filter(
      (f) => !f.includes(".expect.")
    );
    const scenarios = files.map((f) => f.replace(/\.(ass|ssa)$/, ""));
    for (const scenario of scenarios) {
      it(`should perform syntax highlighting on "${scenario}"`, async () => {
        const file = `${scenario}.ass`;
        const filePath = path.join(__dirname, "markup", file);
        const expectedFilePath = filePath.replace(
          /\.(ass|ssa)$/,
          ".expect.html"
        );
        // get rid of byte order mark
        const code = (await readFile(filePath, "utf-8")).trimStart();
        const expected = await readFile(expectedFilePath, "utf-8");
        const result = hljs.highlight(code, {
          language: "ass",
        });
        const actual = result.value;
        actual.trim().should.eql(expected.trim(), file);
      });
    }
  }

  itShouldPerformSyntaxHighlighting();
});
