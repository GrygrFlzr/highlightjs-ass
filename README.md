# Advanced SubStation Alpha plugin for highlight.js

0BSD-licensed [`highlight.js`](https://github.com/highlightjs/highlight.js) plugin of the ASS/SSA subtitle file syntax.

## What is ASS/SSA?

The original SubStation Alpha (SSA) format [dates back to at least 1996](https://web.archive.org/web/19961229054108/http://www.eswat.demon.co.uk/) and has been used for translating media across various written languages.

Advanced SubStation Alpha (ASS) is the latest iteration of SSA, versioned as `4.00+` as opposed to `4.00` and below for the original format. It does not have a true specification, but instead has two de-facto implementations: originally (xy-)vsfilter and later libass.

This project aims to cover both ASS and SSA whenever possible, but significant changes across major versions of SSA may hinder support for older versions. `libass` is treated as the actual specification for the purposes of this project, as they are cross-platform whereas `vsfilter` is limited to Windows, and `libass` maintainers try to keep compatibility with `vsfilter` whenever it makes sense.

## Setup

Requires node.js version 22.12 or later to build.

This project uses `pnpm` as its package manager. If you already installed the latest LTS versions of node.js, you'll already have `corepack` installed.
Use `corepack pnpm install` to install all dependencies.

## Generating CDN builds and Testing

CDN-optimized builds can be generated with

```sh
pnpm build
```

Both markup and detection tests can be done via:

```sh
pnpm test
```

Without having to clone the `highlight.js` project.

However, we are also compatible with the official suite used by `highlight.js`! Clone this project inside `highlight.js/extra` and then from the root directory containing `highlight.js` run:

```sh
npm install
npm run build
npm run test
```

Note that `highlight.js` is [officially de-emphasizing the auto-detect feature](https://github.com/highlightjs/highlight.js/pull/3906/commits/57cf5a332e17611da54d8562c7398cca96722814), so `npm run test-detect` will yield 0 results, but we did make auto-detection work with our own test suite.

## Usage

### In the browser

The bare minimum for using this highlighter on a web page is linking to the `highlight.js` library, one of its themes, this plugin, and then calling `highlightAll`:

**Modern ES6 method**

```html
<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/dark.min.css"
/>
<script type="module">
  import hljs from "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/es/highlight.min.js";
  import hljsAss from "https://cdn.jsdelivr.net/npm/highlightjs-ass@1.0.2/+esm";
  hljs.registerLanguage("ass", hljsAss);
  hljs.highlightAll();
</script>
```

**Traditional Method**

Mainly used if you need IE11 support.

```html
<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/dark.min.css"
/>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/highlight.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/highlightjs-ass@1.0.2"></script>
<script>
  hljs.highlightAll();
</script>
```

**For the plaintext code to highlight**

It is highly recommended to wrap code blocks with `pre` and `code` tags, like this:

```html
<pre><code class="language-ass">
[Script Info]
...
</code></pre>
```

You also want `class="language-ass"` to be explicit about which language syntax should be used. We do support auto-detection, but short snippets may be errenously detected as other supported `highlight.js` languages.
