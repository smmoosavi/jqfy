jQfy
====
[![npm version][npm:version]][npm]
[![Dependencies][dependencies]][david-dm]
[![Downloads][npm:download]][npm]
[![Gitter](https://badges.gitter.im/Join Chat.svg)][gitter]

Compiles in server, Render in browser. [online demo](http://smmoosavi.github.io/jqfy/demo), 
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

Custom tags and attributes
--------------------------

### `script` tag

We write content of script tags to body of function. if `src` attribute exists, content ignored.

#### attributes

* `src`: script path  

### `jqfy:name` attribute

With this attribute you can set variable name. 

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
[gitter]: https://gitter.im/smmoosavi/jqfy?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge "Gitter"
[npm:version]: http://img.shields.io/npm/v/jqfy.svg "version"
[npm:download]: http://img.shields.io/npm/dm/jqfy.svg "Download"
[dependencies]: https://david-dm.org/smmoosavi/jqfy.png "Dependencies"
[david-dm]: https://david-dm.org/smmoosavi/jqfy "Dependencies"
[TODO:not-implemented]: http://img.shields.io/badge/TODO-not%20implemented-yellow.svg "not implemented"
[umd]: https://github.com/umdjs/umd "umd"
[cheerio]: https://github.com/cheeriojs/cheerio "Cheerio"
