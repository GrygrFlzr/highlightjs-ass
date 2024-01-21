/*
Language: Advanced SubStation Alpha
Author: GrygrFlzr <grygrflzr@hotmail.com>
Category: subtitle
Website: https://github.com/libass/libass
*/

/**
 * @typedef {import('highlight.js').Mode} Mode
 */

/** @type {import('highlight.js').LanguageFn} */
export default function (hljs) {
  const regex = hljs.regex;
  const INTEGERS = regex.either(
    ...[
      // integer
      /-?\d+/,
      // scientific integer
      /-?\d*[Ee]\d*/,
    ]
  );
  const DECIMALS = regex.either(
    ...[
      // float
      /-?\d*\.\d+/, // e.g.  .4
      /-?\d+\.\d*/, // e.g. 4.
      // scientific float - no decimal after E
      /-?\d*\.\d*[Ee]\d*/,

      INTEGERS,
    ]
  );
  const ALPHAS = /&H[0-9A-Fa-f]{2}&/;
  const COLORS = /&H[0-9A-Fa-f]{3,8}&/;

  /** @type {Mode} */
  const DECIMAL_TAGS = {
    begin: [
      /\\/,
      regex.either(
        ...[
          "(?:xbord|ybord|xshad|yshad|bord|shad|blur|fscx|fscy|fsc)",
          "(?:pbo|frx|fry|frz|fax|fay|fsp|kf|ko|kt|fe|be|fr|fs|K|k)",
        ]
      ),
      DECIMALS,
    ],
    beginScope: {
      1: "title.function.invoke",
      2: "title.function.invoke",
      3: "params",
    },
  };
  /** @type {Mode} */
  const INTEGER_TAGS = {
    begin: /\\(an|b|q|a(?!lpha))/,
    beginScope: "title.function.invoke",
    end: regex.concat(INTEGERS, "?"),
    endScope: "number",
  };
  /** @type {Mode} */
  const BOOLEAN_TAGS = {
    begin: /\\(i(?!clip)|s|u)/,
    beginScope: "title.function.invoke",
    end: /[01]?/,
    endScope: "number",
  };
  /** @type {Mode} */
  const ALPHA_TAGS = {
    begin: /\\(alpha|1a|2a|3a|4a)/,
    beginScope: "title.function.invoke",
    end: regex.concat(ALPHAS, "?"),
    endScope: "literal",
    relevance: 5,
  };
  /** @type {Mode} */
  const COLOR_TAGS = {
    begin: /\\(1c|2c|3c|4c|c(?!lip))/,
    beginScope: "title.function.invoke",
    end: regex.concat(COLORS, "?"),
    endScope: "literal",
    relevance: 5,
  };
  /** @type {Mode} */
  const FUNCTION_TAGS = {
    begin: [/\\(move|fade|fad|org|pos)/, /\(/, /[^\)]*/, /\)/],
    beginScope: {
      1: "title.function.invoke",
      3: "literals",
    },
    relevance: 2,
  };
  /** @type {Mode} */
  const STRING_TAGS = {
    begin: [/\\(fn|r)/, /[^\\\}]*/],
    beginScope: {
      1: "title.function.invoke",
      2: "string",
    },
  };

  /** @type {Mode} */
  const COMMENTS = {
    variants: [
      hljs.COMMENT(/^;/, "$"),
      hljs.COMMENT(/^Comment:\s+/, "$"),
      hljs.COMMENT(/^Format:\s+/, "$"),
      // SSA 3.x comments
      hljs.COMMENT(/^!: /, "$"),
    ],
    relevance: 5,
  };

  /** @type {Mode} */
  const TRANSFORM_TAGS = {
    scope: "string",
    begin: [/\\t/, /\(/],
    beginScope: {
      1: "title.function.invoke",
    },
    starts: {
      end: /\)/,
      excludeEnd: true,
      scope: "formula",

      contains: [
        DECIMAL_TAGS,
        INTEGER_TAGS,
        BOOLEAN_TAGS,
        ALPHA_TAGS,
        COLOR_TAGS,
        FUNCTION_TAGS,
        STRING_TAGS,
      ],
    },
  };

  /** @type {Mode} */
  const DRAWING_COMMANDS = {
    begin: [/[mnlbspc]? /, DECIMALS, / /, DECIMALS],
    beginScope: {
      1: "built_in",
      2: "link",
      4: "literal",
    },
  };

  /** @type {Mode} */
  const CLIP_TAGS = {
    begin: [/\\i?clip/, /\(/],
    beginScope: {
      1: "built_in",
    },
    starts: {
      end: /\)|$/,
      contains: [
        // vector version
        DRAWING_COMMANDS,
        // rect version
        {
          match: DECIMALS,
          scope: "number",
        },
      ],
    },
    relevance: 5,
  };

  /** @type {Mode} */
  const DRAWING_MODE = {
    begin: /\\p[1-4]/,
    beginScope: "built_in",
    starts: {
      end: /\\p0\}?|$/,
      endsParent: true,
      contains: [
        DRAWING_COMMANDS,
        // these aren't _actually_ part of the \p1 tag
        // but for parsing ease we'll just repeat them
        CLIP_TAGS,
        DECIMAL_TAGS,
        INTEGER_TAGS,
        BOOLEAN_TAGS,
        ALPHA_TAGS,
        COLOR_TAGS,
        FUNCTION_TAGS,
        STRING_TAGS,
      ],
    },
  };

  /** @type {Mode} */
  const BRACE_GROUP = {
    scope: "string",
    begin: /\{/,
    end: /\}/,
    contains: [
      CLIP_TAGS,
      DECIMAL_TAGS,
      INTEGER_TAGS,
      BOOLEAN_TAGS,
      ALPHA_TAGS,
      COLOR_TAGS,
      FUNCTION_TAGS,
      STRING_TAGS,
      // Special cases
      TRANSFORM_TAGS,
      DRAWING_MODE,
    ],
    relevance: 0,
  };

  /** @type {Mode} */
  const SECTION_HEADER = {
    scope: "section",
    begin: /^\[/,
    end: /\]/,
    relevance: 0,
  };

  // \n, \N, and \h
  /** @type {Mode} */
  const SIMPLE_ESCAPE_CHAR = {
    match: /\\[nNh]/,
    scope: "literal",
    relevance: 0,
  };

  /** @type {Mode} */
  const DIALOGUE = {
    begin: [
      /^Dialogue/, // Key
      /:[\t ]/, // Strictly singular space or tab for performance
      /(\d{0,4}|Marked=\d)/, // Layer in ASS, Marked in SSA 3.x and 4.0
      /,/,
      /[:\d.]+/, // Start
      /,/,
      /[:\d.]+/, // End
      /,/,
      /[^,\r\n]+/, // Style
      /,/,
      /[^,\r\n]*/, // Actor
      /,/,
      /\d+/, // MarginL
      /,/,
      /\d+/, // MarginR
      /,/,
      /\d+/, // MarginV
      /,/,
      /[^,\r\n]*/, // Effect
      /,/,
    ],
    beginScope: {
      1: "built_in", // Key
      2: "comment",
      3: "number", // Layer
      4: "comment",
      5: "literal", // Start
      6: "comment",
      7: "title.class", // End
      8: "comment",
      9: "variable.constant", // Style
      10: "comment",
      11: "variable", // Actor Name
      12: "comment",
      13: "comment", // MarginL
      14: "comment",
      15: "comment", // MarginR
      16: "comment",
      17: "comment", // MarginV
      18: "comment",
      19: "comment", // Effect
      20: "comment",
    },
    starts: {
      end: /$/,
      contains: [SIMPLE_ESCAPE_CHAR, BRACE_GROUP],
    },
    relevance: 2,
  };

  /** @type {Mode} */
  const STYLE_DEFINITION = {
    begin: [
      /^Style/, // Key
      /:[\t ]/, // Strictly singular space or tab for performance
      /[^,\r\n]+/, // Name
      /,/,
      /[^,\r\n]+/, // Font Name
      /,/,
      /\d{1,8}/, // Font Size
      /,/,
      // Colors are hex in ASS and signed ints in SSA
      /(&H[0-9A-Fa-f]{2,8}&|-?\d+)/, // Primary Color
      /,/,
      /(&H[0-9A-Fa-f]{2,8}&|-?\d+)/, // Secondary Color
      /,/,
      /(&H[0-9A-Fa-f]{2,8}&|-?\d+)/, // Outline Color
      /,/,
      /(&H[0-9A-Fa-f]{2,8}&|-?\d+)/, // Background Color
      /,/,
      // We don't care about:
      // Bold, Italic, Underline, Strikethrough, ScaleX, ScaleY, Spacing
      // Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR
      // MarginV, Encoding
      /[\d+,-]+$/, // SSA allows negative bold values
    ],
    beginScope: {
      1: "attr", // Key
      2: "comment",
      3: "title.class", // Name
      4: "comment",
      5: "title.class", // Font Name
      6: "comment",
      7: "number", // Font Size
      8: "comment",
      9: "literal", // Primary Color
      10: "comment",
      11: "literal", // Secondary Color
      12: "comment",
      13: "literal", // Outline Color
      14: "comment",
      15: "literal", // Background Color
      16: "comment",
      // We don't care about:
      // Bold, Italic, Underline, Strikethrough, ScaleX, ScaleY, Spacing
      // Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR
      // MarginV, Encoding
      17: "comment",
    },
    relevance: 0,
  };

  // A simple key begins with an alphabet at the start of the line
  // ...followed by any number of alphabetical letters or spaces
  // ...ending with a colon followed immediately by a space, tab or newline.
  // EXCEPT Dialogue, Style, Format, or Comment lines
  /** @type {Mode} */
  const SIMPLE_KEY_VALUE = {
    begin: [
      /^(?!Dialogue|Style|Format|Comment)[A-Za-z][A-Za-z \t]*/,
      /:[\t ]+/,
    ],
    beginScope: {
      1: "attr",
    },
    starts: {
      scope: "string",
      end: /$/,
    },
    relevance: 0,
  };

  return {
    name: "Advanced SubStation Alpha",
    aliases: ["ssa"],
    case_insensitive: false,
    contains: [
      // Partial ASS tags
      BRACE_GROUP,
      SIMPLE_ESCAPE_CHAR,
      // completely defined ASS-files
      SECTION_HEADER,
      COMMENTS,
      SIMPLE_KEY_VALUE,
      DIALOGUE,
      STYLE_DEFINITION,
    ],
  };
}
