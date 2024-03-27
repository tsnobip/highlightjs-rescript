/*
Language: ReScript
Description: Fast, Simple, Fully Typed JavaScript from the Future.
Website: https://rescript-lang.org/
Author: Gidi Meir Morris <oss@gidi.io>, Cheng Lou, Patrick Ecker, Paul Tsnobiladzé
Category: functional
*/

// Note: Extracted and adapted from the reason-highlightjs package:
// https://github.com/reasonml-editor/reason-highlightjs
export default function (hljs) {
  function orReValues(ops) {
    return ops
      .map(function (op) {
        return op
          .split("")
          .map(function (char) {
            return "\\" + char;
          })
          .join("");
      })
      .join("|");
  }

  var RE_IDENT = "[a-z_][0-9a-zA-Z_]*";
  var RE_ATTRIBUTE = "[A-Za-z_][A-Za-z0-9_\\.]*";
  var RE_MODULE_IDENT = "[A-Z_][0-9a-zA-Z_]*";

  var KEYWORDS = {
    // See: https://github.com/rescript-lang/rescript-compiler/blob/182c6e81617a9b83338a7b159af2d9741550f97a/jscomp/syntax/src/res_token.ml#L211
    keyword:
      "and as assert catch constraint downto else exception export external false for " +
      "if in include lazy let module mutable of open private rec switch " +
      "to true try type when while with async await",
    // not reliable
    //built_in:
    //'array bool bytes char exn|5 float int int32 int64 list lazy_t|5 nativeint|5 ref string unit',
    literal: "true false",
  };

  const COMMENT_MODE = {
    scope: "comment",
    variants: [hljs.C_BLOCK_COMMENT_MODE, hljs.C_LINE_COMMENT_MODE],
  };

  const SUBST = {
    scope: "subst",
    begin: "\\$\\{",
    end: "\\}",
    keywords: KEYWORDS,
    contains: [], // defined later
  };

  const TEMPLATE_STRING_MODE = {
    scope: "string",
    variants: [
      {
        begin: "(" + RE_IDENT + ")?`",
        end: "`",
      },
    ],
    contains: [hljs.BACKSLASH_ESCAPE, SUBST],
  };

  const SUBST_INTERNALS = [hljs.QUOTE_STRING_MODE, TEMPLATE_STRING_MODE];
  SUBST.contains = SUBST_INTERNALS.concat({
    // we need to pair up {} inside our subst to prevent
    // it from ending too early by matching another }
    begin: /\{/,
    end: /\}/,
    keywords: KEYWORDS,
    contains: ["self"].concat(SUBST_INTERNALS),
  });

  const RAW_MODE = {
    variants: [
      {
        begin: /%?%raw\(`/,
        end: /`\)/,
        excludeBegin: true,
        excludeEnd: true,
        subLanguage: "javascript",
      },
      {
        begin: /%?%raw\("/,
        end: /"\)/,
        excludeBegin: true,
        excludeEnd: true,
        subLanguage: "javascript",
      },
    ],
  };

  const GRAPHQL_MODE = {
    variants: [
      {
        begin: /%?%relay\(`/,
        end: /`\)/,
        excludeBegin: true,
        excludeEnd: true,
        subLanguage: "graphql",
      },
      {
        begin: /%?%graphql\(`/,
        end: /`\)/,
        excludeBegin: true,
        excludeEnd: true,
        subLanguage: "graphql",
      },
    ],
  };

  const EXTENSION_MODE = {
    variants: [
      {
        begin: /%?%[\.|\w]+\(`/,
        end: /\s*`\)/,
        excludeBegin: true,
        excludeEnd: true,
        subLanguage: [],
      },
      {
        begin: /%?%\w+\("/,
        end: /"\)/,
        excludeBegin: true,
        excludeEnd: true,
        subLanguage: [],
      },
    ],
  };

  const STRING_MODE = {
    scope: "string",
    variants: [
      {
        begin: '"',
        end: '"',
        contains: [hljs.BACKSLASH_ESCAPE],
      },
    ],
  };

  const FUNCTION_MODE = {
    scope: "title.function",
    begin: "=>",
  };

  const CHARACTER_MODE = {
    scope: "string",
    begin: "'[\\x00-\\x7F]'",
    relevance: 0,
  };

  const ESCAPE_CHARACTER_MODE = {
    scope: "char.escape",
    begin: "'\\\\\\w+'",
    relevance: 0,
  };

  const NUMBER_MODE = {
    scope: "number",
    relevance: 0,
    begin:
      "\\b(0[xX][a-fA-F0-9_]+[Lln]?|" +
      "0[oO][0-7_]+[Lln]?|" +
      "0[bB][01_]+[Lln]?|" +
      "[0-9][0-9_]*([Lln]|(\\.[0-9_]+)?([eE][-+]?[0-9_]+)?)?)\\b",
  };

  const OPERATOR_MODE = {
    scope: "operator",
    relevance: 0,
    begin:
      "(" +
      orReValues([
        "->",
        "||",
        "&&",
        "++",
        "**",
        "+.",
        "+",
        "-.",
        "-",
        "*.",
        "*",
        "/.",
        "/",
        "...",
        "..",
        "|>",
        "===",
        "==",
        "^",
        ":=",
        "!",
        ">=",
        "<=",
      ]) +
      ")",
  };

  const ASSIGNMENT_MODE = {
    scope: "operator",
    begin: "=",
    relevance: 0,
  };

  // as in variant constructor
  const CONSTRUCTOR_MODE = {
    scope: "symbol",
    variants: [
      {
        begin: /\b[A-Z][0-9a-zA-Z_]*\b/,
        relevance: 0,
      },
      {
        begin: /#[a-zA-Z][0-9a-zA-Z_]*/,
        relevance: 10,
      },
    ],
  };

  const ARRAY_MODES = {
    scope: "literal",
    variants: [
      {
        begin: "\\[",
      },
      {
        begin: "\\]",
      },
    ],
    relevance: 0,
  };

  const LIST_MODE = {
    relevance: 10,
    variants: [
      {
        begin: ["list", "{}?"],
        beginScope: { 1: "literal" },
      },
    ],
  };

  const OBJECT_ACCESS_MODE = {
    scope: "property",
    relevance: 0,
    variants: [
      {
        begin: RE_IDENT + "\\[",
        end: "\\]",
        contains: [
          // hljs.BACKSLASH_ESCAPE
          STRING_MODE,
        ],
      },
    ],
  };

  const MODULE_ACCESS_MODE = {
    begin: "\\b" + RE_MODULE_IDENT + "\\.",
    returnBegin: true,
    contains: [
      {
        begin: RE_MODULE_IDENT,
        scope: "title.class",
      },
    ],
  };

  const JSX_MODE = {
    illegal: ["%", "type", "!DOCTYPE", "!--", "xmlns"],
    variants: [
      {
        begin: "<>|</>|/>",
      },
      {
        begin: "</",
        contains: [
          {
            begin: RE_IDENT,
            scope: "tag",
            relevance: 0,
          },
          {
            begin: RE_MODULE_IDENT,
            scope: "title.class",
          },
        ],
      },
      {
        begin: "<",
        contains: [
          {
            begin: RE_IDENT,
            scope: "tag",
            relevance: 0,
          },
          {
            begin: RE_MODULE_IDENT,
            scope: "title.class",
          },
        ],
      },
    ],
  };

  // Foo.Bar.Baz where Baz is actually a module, not a constructor
  const MODULE_ACCESS_ENDS_WITH_MODULE = {
    begin: RE_MODULE_IDENT,
    returnBegin: true,
    contains: [
      {
        begin: RE_MODULE_IDENT,
        scope: "title.class",
      },
      {
        begin: "\\.",
        contains: [
          {
            begin: RE_MODULE_IDENT,
            scope: "title.class",
          },
        ],
      },
    ],
  };

  const ATTRIBUTE_MODE = {
    scope: "attribute",
    variants: [
      // order matters here
      {
        begin: "@@?(" + RE_ATTRIBUTE + ") *\\(",
        end: "\\s*\\)",
      },
      {
        begin: "@@?(" + RE_ATTRIBUTE + ")",
      },
      {
        begin: "%%?(" + RE_ATTRIBUTE + ")\\(",
        end: "\\s*\\)",
      },
      {
        begin: "%%?(" + RE_ATTRIBUTE + ")",
      },
    ],
  };

  // all the modes below are mutually recursive
  let OPEN_OR_INCLUDE_MODULE_MODE = {
    begin: "\\b(open|include)\\s*",
    keywords: KEYWORDS,
    contains: [MODULE_ACCESS_ENDS_WITH_MODULE],
  };
  let MODULE_MODE = {
    begin: "\\s*\\{\\s*",
    end: "\\s*\\}\\s*",
    keywords: KEYWORDS,
    returnBegin: true,
    // most of the order here is important
    contains: [
      COMMENT_MODE,
      // there's also a block mode technically, but for our purpose, a module {}
      // and a block {} can be considered the same for highlighting
      CHARACTER_MODE,
      ESCAPE_CHARACTER_MODE,
      RAW_MODE,
      GRAPHQL_MODE,
      EXTENSION_MODE,
      STRING_MODE,
      TEMPLATE_STRING_MODE,
      FUNCTION_MODE,
      ATTRIBUTE_MODE,
      ARRAY_MODES,
      LIST_MODE,
      JSX_MODE,
      OPERATOR_MODE,
      ASSIGNMENT_MODE,
      NUMBER_MODE,
      OPEN_OR_INCLUDE_MODULE_MODE,
      MODULE_ACCESS_MODE,
      CONSTRUCTOR_MODE,
      OBJECT_ACCESS_MODE,
    ],
  };
  const MODULE_DECLARATION_MODE = {
    begin: "\\bmodule\\s+(type\\s+)?(of\\s+)?",
    keywords: KEYWORDS,
    illegal: "struct|sig",
    contains: [
      // this definitely gets matched, and first. always `module Foo`
      {
        begin: RE_MODULE_IDENT,
        scope: "title.class",
      },
      // and then an optional type signature is matched. Hopefully this regex
      // doesn't accidentally match something else
      {
        begin: "\\s*:\\s*",
        contains: [
          {
            begin: RE_MODULE_IDENT,
            scope: "title.class",
          },
          MODULE_MODE,
        ],
      },
      // then the = part and the right hand side
      {
        begin: "\\s*=\\s*",
        contains: [
          MODULE_ACCESS_ENDS_WITH_MODULE,
          // alternatively, a functor declaration
          {
            begin: "\\s*\\(\\s*",
            end: "\\s*\\)\\s*",
            keywords: KEYWORDS,
            contains: [
              {
                begin: RE_MODULE_IDENT,
                scope: "title.class",
              },
              // module Foo = (Bar: Baz) => ...
              {
                begin: "\\s*:\\s*",
                contains: [
                  {
                    begin: RE_MODULE_IDENT,
                    scope: "title.class",
                  },
                  MODULE_MODE,
                  {
                    begin: "\\s*,\\s*",
                  },
                ],
              },
              MODULE_MODE,
            ],
          },
          MODULE_MODE,
          {
            begin: "\\s*=>\\s*",
          },
        ],
      },
    ],
  };
  MODULE_MODE.contains.unshift(MODULE_DECLARATION_MODE);
  OPEN_OR_INCLUDE_MODULE_MODE.contains.push(MODULE_MODE);

  return {
    name: "ReScript",
    aliases: ["res", "resi"],
    keywords: KEYWORDS,
    illegal: [
      /:-/,
      /\+=/,
      /-=/,
      /::=/,
      /;/,
      /class/,
      /interface/,
      /val/,
      /import/,
      /end /,
      /<%/,
      /%>/,
      /<!DOCTYPE /,
      /DOCTYPE /,
      /<!--/,
      /-->/,
      /<script /,
      /<\/script>/,
      /xmlns/,
      /{#/,
      /{\//,
      /#\s+/,
      /func /,
      /package/,
      /\$\w+/,
      /\$ /,
      /do /,
      /done /,
      /GOTO /,
      /BEGIN /,
      /IF/,
      /\$if/,
      /\$noop/,
      /\.\(/,
    ],
    // lol beautiful
    contains: MODULE_MODE.contains,
  };
}
