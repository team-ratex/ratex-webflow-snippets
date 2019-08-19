## How is shipping-tracker minified?

After writing in ES6, syntax in `shipping-tracker.js`, 
1. Go to [https://babeljs.io/repl](https://babeljs.io/repl).
2. Paste the whole chunk of code in (don't minify yet, there's a known bug causing it to crash)
3. Copy the output
4. Minify the ES5 output at [http://minifycode.com/javascript-minifier/](http://minifycode.com/javascript-minifier/)
5. Copy the minified, ES5 output and paste it in `shipping-tracker.dist.js`