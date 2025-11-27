/*
Language: Advanced SubStation Alpha
Author: GrygrFlzr <git@cybeast.dev>
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
      regex.either(DECIMALS, INTEGERS),
    ],
    beginScope: {
      1: "title.function.invoke",
      2: "title.function.invoke",
      3: "number",
    },
  };
  /** @type {Mode} */
  const INTEGER_TAGS = {
    begin: /\\(an|b|q|a(?!lpha))/,
    beginScope: "title.function.invoke",
    end: regex.concat("(?:", INTEGERS, ")?", /(?=[\}\\]|$)/),
    endScope: "number",
  };
  /** @type {Mode} */
  const BOOLEAN_TAGS = {
    begin: /\\(i(?!clip)|s|u)/,
    beginScope: "title.function.invoke",
    end: regex.concat(/[01]?/, /(?=[\}\\]|$)/),
    endScope: "number",
  };
  /** @type {Mode} */
  const ALPHA_TAGS = {
    begin: /\\(alpha|1a|2a|3a|4a)/,
    beginScope: "title.function.invoke",
    end: regex.concat("(?:", ALPHAS, ")?", /(?=[\}\\]|$)/),
    endScope: "literal",
    relevance: 5,
  };
  /** @type {Mode} */
  const COLOR_TAGS = {
    begin: /\\(1c|2c|3c|4c|c(?!lip))/,
    beginScope: "title.function.invoke",
    end: regex.concat("(?:", COLORS, ")?", /(?=[\}\\]|$)/),
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
    end: /(?=[\}\\]|$)/,
    relevance: 2,
  };
  /** @type {Mode} */
  const STRING_TAGS = {
    begin: [/\\(fn|r)/, /[^\\\}]*/],
    beginScope: {
      1: "title.function.invoke",
      2: "string",
    },
    end: /(?=[\}\\]|$)/,
  };

  /** @type {Mode} */
  const COMMENTS = {
    variants: [
      hljs.COMMENT(/^;/, "$"),
      hljs.COMMENT(/^Data:\s+/, "$"), // aegisub extradata
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
      end: /\)|$/,
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
    begin: [
      /[mnlbspc]? /,
      regex.either(DECIMALS, INTEGERS),
      / /,
      regex.either(DECIMALS, INTEGERS),
    ],
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
      end: /[)}]|$/,
      contains: [
        // vector version
        DRAWING_COMMANDS,
        // rect version
        {
          match: regex.either(DECIMALS, INTEGERS),
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
    scope: "comment",
    begin: /\{/,
    end: regex.either(/\}/, /$/),
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

  /**
   * Modern ASS or SSA 4.x dialogue
   * @type {Mode}
   **/
  const DIALOGUE = {
    begin: [
      /^Dialogue/, // Key
      /:[\t ]/, // Strictly singular space or tab for performance
      /\d{0,3}/, // Layer in ASS and SSA 4
      /,/,
      /[:\d.]+/, // Start
      /,/,
      /[:\d.]+/, // End
      /,/,
      /[^,\r\n]+/, // Style
      /,/,
      /[^,\r\n]*/, // Actor
      /,/,
      // Limit to 4 digits as that was what Sub Station generated
      /\d{0,4}/, // MarginL
      /,/,
      /\d{0,4}/, // MarginR
      /,/,
      /\d{0,4}/, // MarginV
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
    relevance: 10,
  };

  /** @type {Mode} */
  const SSA_2_OR_3_DIALOGUE = {
    begin: [
      /^Dialogue/, // Key
      /:[\t ]/, // Strictly singular space or tab for performance
      /Marked=\d/, // Layer in ASS
      /,/,
      /[:\d.]+/, // Start
      /,/,
      /[:\d.]+/, // End
      /,/,
      /[^,\r\n]+/, // Style
      /,/,
      /[^,\r\n]*/, // Actor
      /,/,
      /\d{4}/, // MarginL
      /,/,
      /\d{4}/, // MarginR
      /,/,
      /\d{4}/, // MarginV
      /,/,
      // Effect is stricter in SSA 2 and 3
      // as other authoring tools were not in much use
      /(![Ee]ffect|[Kk]araoke|[Ss]croll ?[Uu]p|)/,
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
      19: "built_in", // Effect
      20: "comment",
    },
    starts: {
      end: /$/,
      contains: [SIMPLE_ESCAPE_CHAR, BRACE_GROUP],
    },
    relevance: 10,
  };

  /**
   * \C1, \C3 - \C7 tags seen in SSA 1 scripts
   * Also \CF
   * @type {Mode}
   */
  const SSA_1_COLOR = {
    begin: /\\C/,
    end: /[\dF]/,
    beginScope: "title.function.invoke",
    endScope: "title.function.invoke",
  };

  /**
   * \F1 and \F2 tags seen in SSA 1 scripts
   * @type {Mode}
   */
  const SSA_1_F_TAG = {
    begin: /\\F/,
    end: /[12]/,
    beginScope: "title.function.invoke",
    endScope: "title.function.invoke",
  };

  /**
   * \I tags seen in SSA 1 scripts
   * @type {Mode}
   */
  const SSA_1_ITALICS = {
    begin: /\\I/,
    beginScope: "title.function.invoke",
  };

  /** @type {Mode} */
  const SSA_1_DIALOGUE = {
    begin: [
      /^Dialogue/, // Key
      /:[\t ]/, // Strictly singular space or tab for performance
      /Marked=\d/, // Marked in SSA 1.x
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
      /,(?!!Effect,)/,
      // No effect field, it was added in v2+
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
    },
    starts: {
      end: /$/,
      contains: [
        SIMPLE_ESCAPE_CHAR,
        SSA_1_COLOR,
        SSA_1_F_TAG,
        SSA_1_ITALICS,
        BRACE_GROUP,
      ],
    },
    relevance: 10,
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
      /(&H[0-9A-Fa-f]{2,8}&?|-?\d+)/, // Primary Color
      /,/,
      /(&H[0-9A-Fa-f]{2,8}&?|-?\d+)/, // Secondary Color
      /,/,
      /(&H[0-9A-Fa-f]{2,8}&?|-?\d+)/, // Outline Color
      /,/,
      /(&H[0-9A-Fa-f]{2,8}&?|-?\d+)/, // Background Color
      /,/,
      // We don't care about:
      // Bold, Italic, Underline, Strikethrough, ScaleX, ScaleY, Spacing
      // Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR
      // MarginV, Encoding
      /[\d+,.-]+$/, // Allow negative and decimal values
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
    relevance: 10,
  };

  // A simple key begins with an alphabet at the start of the line
  // ...followed by any number of alphabetical letters or spaces
  // ...ending with a colon followed immediately by a space, tab or newline.
  // EXCEPT Dialogue, Style, Format, Comment, or Data lines
  /** @type {Mode} */
  const SIMPLE_KEY_VALUE = {
    begin: [
      /^(?!Dialogue|Style|Format|Comment|Data)[A-Za-z][A-Za-z \t]*/,
      /:[\t ]*/,
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
      SSA_2_OR_3_DIALOGUE,
      SSA_1_DIALOGUE,
      STYLE_DEFINITION,
    ],
  };
}
