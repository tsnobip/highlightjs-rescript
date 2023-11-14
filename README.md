# highlightjs-rescript

[ReScript](https://rescript-lang.org/) programming language grammar for Highlight.js

## Usage

Simply load this module after loading Highlight.js. You'll use the minified version found in the `dist` directory.
This module is just a CDN build of the language, so it will register itself as the JavaScript is loaded.

```html
<script type="text/javascript" src="/path/to/highlight.min.js"></script>
<script
  type="text/javascript"
  src="/path/to/highlightjs-rescript/dist/rescript.min.js"
></script>
<script type="text/javascript">
  hljs.highlightAll();
</script>
```

For more details of the usage see [Highlight.js main page](https://github.com/highlightjs/highlight.js#readme).
