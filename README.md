aha.js
======

Converts ANSI-colored terminal output into HTML.

A JS port of [aha](https://github.com/theZiz/aha).

usage
-----

```js
var aha = require('aha'),
    child = require('child_process');

child.exec('git log --color=always', { encoding: 'hex' }, function(error, stdout, stderr) {
    // consumes and produces a Buffer
    process.stdout.write(aha(new Buffer(stdout, 'hex')));
});
```
