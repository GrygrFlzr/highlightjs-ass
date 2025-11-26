import babel from "@rollup/plugin-babel";
import terser from "@rollup/plugin-terser";
import pkg from "./package.json" with { type: "json" };
import { defineConfig } from "rollup";

const HLJS_ASS_VERSION = pkg.version;
const HLJS_VERSION = pkg.devDependencies["highlight.js"];
const VERSION_STRING = `
/**!
 * \`ass\` grammar v${HLJS_ASS_VERSION} compiled for Highlight.js ${HLJS_VERSION}
 * License: 0BSD
 **/
`.trim();

export default defineConfig([
  {
    plugins: [
      babel({
        babelHelpers: "bundled",
        presets: ["@babel/preset-env"],
      }),
    ],
    input: "./src/languages/ass.js",
    output: {
      file: "dist/ass.es.min.js",
      format: "esm",
      banner: VERSION_STRING,
      plugins: [terser()],
      sourcemap: true,
    },
    external: ["highlight.js"],
  },
  {
    plugins: [
      babel({
        babelHelpers: "bundled",
        presets: ["@babel/preset-env"],
      }),
    ],
    input: "./src/iife.js",
    output: {
      file: "dist/ass.min.js",
      format: "iife",
      banner: VERSION_STRING,
      inlineDynamicImports: true,
      plugins: [terser()],
      sourcemap: true,
    },
    external: ["highlight.js"],
  },
]);
