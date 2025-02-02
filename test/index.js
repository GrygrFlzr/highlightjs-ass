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
hljs.debugMode();
const readdir = promisify(fs.readdir);

const markupFiles = (
  await readdir(path.join(__dirname, "markup", "ass"))
).filter((f) => !f.includes(".expect."));

describe("ASS syntax highlighting", () => {
  function itShouldPerformSyntaxHighlighting() {
    for (const file of markupFiles) {
      it(`should perform syntax highlighting on "${file}"`, (done) => {
        const filePath = path.join(__dirname, "markup", "ass", file);
        const expectedFilePath = filePath.replace(
          /\.(ass|ssa)$/,
          ".expect.html"
        );
        // get rid of byte order mark
        fs.readFile(
          filePath,
          {
            encoding: "utf-8",
          },
          (sourceErr, sourceText) => {
            if (sourceErr) {
              done(sourceErr);
              return;
            }
            fs.readFile(
              expectedFilePath,
              {
                encoding: "utf-8",
              },
              (expectedFileErr, expectedText) => {
                if (expectedFileErr) {
                  done(expectedFileErr);
                  return;
                }
                const result = hljs.highlight(sourceText, {
                  language: "ass",
                });
                const actual = result.value;
                actual.trim().should.eql(expectedText.trim(), file);
                done();
              }
            );
          }
        );
      });
    }
  }

  itShouldPerformSyntaxHighlighting();
});

const detectFiles = await readdir(path.join(__dirname, "detect"));

describe("ASS auto-detection", () => {
  function itShouldPerformAutoDetection() {
    for (const file of detectFiles) {
      it(`should detect "${file}" as "ass"`, (done) => {
        const filePath = path.join(__dirname, "detect", file);
        // get rid of byte order mark
        fs.readFile(
          filePath,
          {
            encoding: "utf-8",
          },
          (sourceErr, sourceText) => {
            if (sourceErr) {
              done(sourceErr);
              return;
            }
            const result = hljs.highlightAuto(sourceText);
            hljs;
            const detectedLanguage = result.language;
            "ass".should.eql(detectedLanguage, "Expected language mismatch");
            done();
          }
        );
      });
    }
  }

  itShouldPerformAutoDetection();
});
