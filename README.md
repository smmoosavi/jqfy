jQfy
====
[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/smmoosavi/jqfy?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![npm version][npm:version]][npm]
[![Dependencies][dependencies]][david-dm]
[![Downloads][npm:download]][npm]

Complies in server, Render in browser. [online demo](http://smmoosavi.github.io/jqfy/demo), 
[examples](http://smmoosavi.github.io/jqfy/examples)

Install
-------

```
$ npm install -g jqfy
```

Usage
-----

Complie htmls

```
$ mkdir templates/
$ vim templates/well.html # write your sub html
$ jqfy -i templates/ -o js/templates.js
```

Use in browser:
 
```html
<script src="js/jquery.min.js"></script>
<script src="js/templates.js"></script>
<script>
    $('body').append(templates.well())
</script>
```

help
----

```
$ jqfy -h
  
    Usage: jqfy [options]
  
    Options:
  
      -h, --help                   output usage information
      -V, --version                output the version number
      -i, --input [path]           source file or directory (default: .)
      -o, --output [path]          destination file
      -r, --return-type [type]     choice return type (root|contents|html)
      -e, --ext [ext]              extensions (default: html)
      -n, --namespace [namespace]  namespace (default: templates)
      --fix-return-type            fix return type of generated function
      --use-shortcut-functions     use shortcut functions in generated function
      -T, --no-trim                do not trim
      -C, --no-comment             ignore comments

```

Api
---

### jqfy.compile(html, [opts])

#### arguments: 

* `html`: string
* `opts`: object
  * `name`: string|array 
  * `returnType`: string, (contents|html|root), default: contents 
  * `trim`: boolean, default true
  * `comment`: boolean, default true
  * `fixReturnType`: boolean, default false
  * `returnObject`: boolean, default false

**html**: input html

**opts.name**: name of generated function as string or array. when you are use nested name, this better to use array.

**opts.returnType**: default return type of generated function.

**opts.trim**: remove white unnecessary white spaces.

**opts.comment**: keep html comments.

**opts.fixReturnType**: boolean, if true, fix return type of generated function, else generated function check `returnType` option.

**opts.returnObject**: boolean, if true, return object and set output in `$` field of object. it will be useful sometimes

#### return

code of generated function

### jqfy.append(html, [opts])

like compile, but save code in memory

### jqfy.getCode([name],[opts])

get in memory generated code with [umd][umd]

#### arguments

* `name`: string, default `templates`. name for umd module
* `opts`: object
 * `useShortcutFunctions`: boolean, default false
 * and all options that available in compile.

**name**: name of global variable used in umd.
 
**opts.useShortcutFunctions**: boolean, if true, we generate some shortcut function and use them. If you are compiling many
 files, this option cause you got smaller file.

### jqfy.flush()

remove in memory codes

Example
-------
```js
var html = '<div class="text-success">jQfy</div>';
html += '<script>console.log("jQfy");</script>';
var jqfy = require('jqfy');
var code = jqfy.compile(html);
console.log(code);
```

output:

```js
function (data, opts) {
    // generated by jQfy 1.3.6
    opts = $.extend({}, opts);
    data = $.extend({}, data);
    var $root = $('<div/>');
    
    var $div1 = $('<div/>')
        .addClass("text-success")
        .appendTo($root);
    $div1.append(document.createTextNode("jQfy"));
    //  end $div1
    
    // start script 1
    console.log("jQfy");
    //  end script 1
    
    // end $root
    var output = null;
    switch (opts.returnType) {
        case "html":
            output = $root.html();
            break;
        case "root":
            output = $root;
            break;
        case "contents":
        case "children":
            // children will be removed in version 2.*
            output = $root.contents();
            break;
        default :
            output = $root.contents();
    }
    return output;
}
```
Custom tags and attributes
--------------------------

### `script` tag

We write content of script tags to body of function.

### `jqfy:name` attribute

Whit this attribute you can set variable name. 

### `{{val}}` in text or attribute name and value

render value of `data.val` in the output html.

note: in attribute name use `{{var}}` without space. for example `{{ x }}` not supported in attributes name

#### example

input html:
```html
<div id="div-{{ i }}" class="text-{{ type }}" data-{{k}}="{{ v }}">
    {{i}}: {{ text }}
</div>
```

use:
```js
render({
  i: 5,
  type: 'info',
  k: 'target',
  v: '#form-1',
  text: 'Hi jQfy'
}, {returnType: 'html'})
```

output:
```html
<div id="div-5" class="text-info" data-target="#form-1">5: Hi jQfy</div>
```

How it works
------------

First we parse your html with [cheerio][cheerio] then foreach tag generate a code. This code create a jquery object
and set id, class and attributes of element, then append jquery object to parent's jquery object. if script tags exist
in your html, we append content of script to generated code.

[npm]: https://www.npmjs.org/package/jqfy "npm"
[npm:version]: http://img.shields.io/npm/v/jqfy.svg "version"
[npm:download]: http://img.shields.io/npm/dm/jqfy.svg "Download"
[dependencies]: https://david-dm.org/smmoosavi/jqfy.png "Dependencies"
[david-dm]: https://david-dm.org/smmoosavi/jqfy "Dependencies"
[TODO:not-implemented]: http://img.shields.io/badge/TODO-not%20implemented-yellow.svg "not implemented"
[umd]: https://github.com/umdjs/umd "umd"
[cheerio]: https://github.com/cheeriojs/cheerio "Cheerio"