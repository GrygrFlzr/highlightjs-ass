#!/usr/bin/env node
import packageData from "./package.json" with { type: "json" };
import * as esbuild from "esbuild";

const HLJS_ASS_VERSION = packageData.version;
const HLJS_VERSION = packageData.devDependencies["highlight.js"];
const VERSION_STRING = `/*! \`ass\` grammar v${HLJS_ASS_VERSION} compiled for Highlight.js ${HLJS_VERSION} */`;

await esbuild.build({
  entryPoints: ["./src/languages/ass.js"],
  banner: {
    js: VERSION_STRING,
  },
  bundle: true,
  minify: true,
  sourcemap: false,
  target: ["es2015"], // match hl.js
  outfile: "dist/ass.es.min.js",
  format: "esm",
});
await esbuild.build({
  entryPoints: ["./src/iife.js"],
  banner: {
    js: VERSION_STRING,
  },
  external: ["highlight.js"],
  bundle: true,
  minify: true,
  sourcemap: false,
  target: ["es2015"], // match hl.js
  outfile: "dist/ass.min.js",
  format: "iife",
});
