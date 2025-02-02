import { defineConfig } from "rolldown";
import terser from "@rollup/plugin-terser";
import packageData from "./package.json" with { type: "json" };

const HLJS_ASS_VERSION = packageData.version;
const HLJS_VERSION = packageData.devDependencies["highlight.js"];
const VERSION_STRING = `
/**!
 * \`ass\` grammar v${HLJS_ASS_VERSION} compiled for Highlight.js ${HLJS_VERSION}
 * License: 0BSD
 **/
`.trim();

export default defineConfig([
  {
    input: "./src/languages/ass.js",
    output: {
      file: "dist/ass.es.min.js",
      format: "esm",
      banner: VERSION_STRING,
      target: "es2015",
      plugins: [terser()],
    },
    platform: "neutral",
  },
  {
    input: "./src/iife.js",
    output: {
      file: "dist/ass.min.js",
      format: "iife",
      banner: VERSION_STRING,
      inlineDynamicImports: true,
      target: "es2015",
      plugins: [terser()],
    },
    external: ["highlight.js"],
    platform: "browser",
  },
]);
