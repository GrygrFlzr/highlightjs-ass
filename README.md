# Advanced SubStation Alpha plugin for highlight.js

0BSD-licensed plugin for the ASS/SSA subtitle file syntax.

## What is ASS/SSA?

The original SubStation Alpha (SSA) format dates back to at least [1996](https://web.archive.org/web/19961229054108/http://www.eswat.demon.co.uk/) and has been used for translating media across various spoken languages.

Advanced SubStation Alpha (ASS) is the latest iteration of SSA, versioned as `4.00+` as opposed to `4.00` and below for the original format. It does not have a true specification, but instead has two de-facto implementations: originally (xy-)vsfilter and later libass.

This project aims to cover both ASS and SSA whenever possible, but significant changes across major versions of SSA may hinder support for older versions. libass is treated as the actual specification for the purposes of this project, as they are cross-platform whereas vsfilter is limited to Windows, and libass maintainers try to keep compatibility with vsfilter whenever it makes sense.

## Known Issues

- Match official highlight.js tooling to generate a browser/CDN/node versions
