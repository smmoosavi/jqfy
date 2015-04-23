var _ = require('lodash');
var version = require('../package.json').version;
var CodeGen = require('./codeGen');
var cheerio = require('cheerio');
var util = require('util');

function JQfy() {
    var jqfy = this;

    function defineShortCutFunctions(cg, opts) {
        opts = _.extend({
            fixReturnType: false
        }, opts);
        cg.comment('==================');
        cg.comment('Shortcut functions');
        cg.raw();
        /* text function */
        cg.startFunction('_TEX', ['text']);
        cg.rawFormat('return document.createTextNode(text);');
        cg.endFunction();
        cg.raw();

        /* comment function */
        cg.startFunction('_COM', ['text']);
        cg.rawFormat('return document.createComment(text);');
        cg.endFunction();
        cg.raw();

        if (!opts.fixReturnType) {
            /* output function*/
            cg.startFunction('_OUTPUT', ['$root', 'defaultOutput', 'optionOutput']);
            cg.startSwitch('optionOutput');

            cg.writeCase('html');
            cg.raw('return $root.html();');
            cg.writeBreak();

            cg.writeCase('root');
            cg.raw('return $root;');
            cg.writeBreak();

            cg.writeCase('contents');
            cg.writeCase('children');
            cg.comment('children will be removed in version 2.*');
            cg.raw('return $root.contents();');
            cg.writeBreak();

            cg.writeDefault();
            cg.endSwitch();

            cg.startSwitch('defaultOutput');

            cg.writeCase('html');
            cg.raw('return $root.html();');
            cg.writeBreak();

            cg.writeCase('root');
            cg.raw('return $root;');
            cg.writeBreak();

            cg.writeCase('contents');
            cg.writeCase('children');
            cg.comment('children will be removed in version 2.*');
            cg.raw('return $root.contents();');
            cg.writeBreak();

            cg.writeDefault();
            cg.raw('return $root.contents();');
            cg.endSwitch();

            cg.endFunction();
            cg.raw();
        }
    }

    function extractVariables(text) {
        var pat = /\{\{([^\{\}]+)\}\}/gm;
        var match;
        var i = 0;
        var out = '';
        while (true) {
            match = pat.exec(text);
            if (!match) {
                break;
            }
            out = out + JSON.stringify(text.substring(i, match.index));
            var variable = match[1].trim();
            out = out + util.format(' + (data.%s == undefined ? "" : data.%s) + ', variable, variable);
            i = pat.lastIndex;
        }
        out = out + JSON.stringify(text.substring(i, text.length));
        return out;
    }

    function writeCreateTextNode(cg, parent, text, opts) {
        opts = _.extend({
            _useShortcutFunctions: false
        }, opts);
        var value = extractVariables(text);
        if (opts._useShortcutFunctions) {
            cg.rawFormat('%s.append(_TEX(%s));', parent, value);
        } else {
            cg.rawFormat('%s.append(document.createTextNode(%s));', parent, value);
        }
    }

    function writeCreateComment(cg, parent, text, opts) {
        opts = _.extend({
            _useShortcutFunctions: false
        }, opts);
        var comment = extractVariables(text);
        if (opts._useShortcutFunctions) {
            cg.rawFormat('%s.append(_COM(%s));', parent, comment);
        } else {
            cg.rawFormat('%s.append(document.createComment(%s));', parent, comment);
        }
    }

    function writeOutput(cg, opts) {
        opts = _.extend({
            returnType: 'contents',
            _useShortcutFunctions: false,
            fixReturnType: false
        }, opts);
        var d = "";
        switch (opts.returnType) {
            case 'html':
                d = "output = $root.html();";
                break;
            case 'root':
                d = "output = $root;";
                break;
            case 'contents':
                d = "output = $root.contents();";
                break;
            default :
                d = "output = $root.contents();";
                opts.returnType = 'contents';
        }
        if (!opts.fixReturnType) {
            if (opts._useShortcutFunctions) {
                cg.rawFormat('var output = _OUTPUT($root, %s, %s);', JSON.stringify(opts.returnType), 'opts.returnType');
            } else {
                cg.raw('var output = null;');


                cg.startSwitch('opts.returnType');

                cg.writeCase('html');
                cg.raw('output = $root.html();');
                cg.writeBreak();

                cg.writeCase('root');
                cg.raw('output = $root;');
                cg.writeBreak();

                cg.writeCase('contents');
                cg.writeCase('children');
                cg.comment('children will be removed in version 2.*');
                cg.raw('output = $root.contents();');
                cg.writeBreak();

                cg.writeDefault();
                cg.raw(d);

                cg.endSwitch();
            }
        } else {
            cg.raw('var ' + d);
        }
    }

    jqfy.compile = function (html, opts) {
        opts = _.extend({
            returnType: 'contents', // html, root, contents [children is deprecated]
            name: '', // string or array of string,
            trim: true, // true, false
            comment: true, // true, false
            _useShortcutFunctions: false,
            fixReturnType: false,
            returnObject: false
        }, opts);
        if (opts.returnType == 'children') {// TODO remove in version 2.*
            opts.returnType = 'contents';
        }
        var name = CodeGen.normalizeName(opts.name);
        var cg = new CodeGen();
        var commentIndent = 0;
        var counts = {};

        function generate(node, parentCtx) {
            // node.startIndex
            if (parentCtx === undefined) {
                parentCtx = {};
            }
            var ctx = {};
            var variable;
            ctx.pre = parentCtx.pre;
            if (node.type == 'root') {
                variable = '$root';
            }
            if (node.type == 'tag') {
                cg.raw();
                if (counts[node.name] === undefined) {
                    counts[node.name] = 1;
                }
                variable = '$' + node.name + counts[node.name];
                if (node.attribs['jqfy:name'] && CodeGen.isValidVariable(node.attribs['jqfy:name'])) {
                    variable = node.attribs['jqfy:name'];
                }
                counts[node.name] += 1;
                cg.rawFormat("var %s = $('<%s/>')", variable, node.name);
                cg.incIndent();
                if (node.attribs.id) {
                    cg.rawFormat('.attr(%s, %s)', JSON.stringify('id'), extractVariables(node.attribs.id));
                }

                if (node.attribs['class']) {
                    cg.rawFormat('.addClass(%s)', extractVariables(node.attribs.class));
                }

                Object.keys(node.attribs).forEach(function (a) {
                    if (a.indexOf('jqfy:') === 0) {
                        return;
                    }
                    var v = node.attribs[a];
                    if (a == 'class') {
                        return;
                    }
                    if (a == 'id') {
                        return;
                    }
                    cg.rawFormat('.attr(%s, %s)', extractVariables(a), extractVariables(v));
                });
                cg.rawFormat('.appendTo(%s);', parentCtx.parent);
                cg.decIndent();
                if (node.name == 'pre') {
                    ctx.pre = true;
                }
            }
            if (node.type == 'text') {
                var text = node.data;

                if (opts.trim && !ctx.pre) {
                    text = text.replace(/^\s+$/,'').replace(/^\s+/,' ').replace(/\s+$/,' ');
                }

                if (text) {
                    writeCreateTextNode(cg, parentCtx.parent, text, {_useShortcutFunctions: opts._useShortcutFunctions});
                }
            }
            if (node.type == 'comment') {
                if (opts.comment) {
                    writeCreateComment(cg, parentCtx.parent, node.data, {_useShortcutFunctions: opts._useShortcutFunctions});
                }
            }
            if (node.type == 'script') {
                if (counts.script === undefined) {
                    counts.script = 1;
                }
                var startScript = 'start script ' + counts.script;
                var endScript = ' end script ' + counts.script;
                if (node.attribs.src && opts._loader) {
                    var script = opts._loader(node.attribs.src, opts._path);
                    if (script) {
                        cg.raw();
                        cg.comment(startScript);
                        cg.raw(script);
                        cg.comment(endScript);
                        cg.raw();
                    }
                } else if (node.children && node.children[0]) {
                    cg.raw();
                    cg.comment(startScript);
                    cg.raw(node.children[0].data);
                    cg.comment(endScript);
                    cg.raw();
                }
                counts.script += 1;
                return;
            }
            ctx.parent = variable;
            if (node.children) {
                commentIndent++;
                node.children.forEach(function (child) {
                    generate(child, ctx);
                });
                cg.comment(new Array(commentIndent).join(' ') + 'end ' + variable);
                commentIndent--;
            }

        }

        var ch = cheerio.load(html, {
            withStartIndices: true
        });

        cg.startFunction(name, ['data', 'opts']);
        cg.comment('generated by jQfy ' + version);

        cg.raw('opts = $.extend({}, opts);');
        cg.raw('data = $.extend({}, data);');
        if (opts.returnObject) {
            cg.raw('var obj = {};');
        }

        cg.raw("var $root = $('<div/>');");
        generate(ch._root);

        writeOutput(cg, {
            returnType: opts.returnType,
            _useShortcutFunctions: opts._useShortcutFunctions,
            fixReturnType: opts.fixReturnType
        });

        if (opts.returnObject) {
            cg.raw('obj.$ = output;');
            cg.raw('return obj;');
        } else {
            cg.raw('return output;');
        }
        cg.endFunction();
        return cg.getCode();
    };


    var memory = [];
    jqfy.append = function (html, opts) {
        opts = _.extend({}, opts);
        if (opts.name === undefined) {
            throw new Error('Name is required');
        }
        if (typeof opts.name == 'string') {
            opts.name = [opts.name];
        }
        opts.name.unshift('templates');
        memory.push({
            html: html,
            opts: opts,
            name: opts.name
        });
    };
    jqfy.getCode = function (name, opts) {
        opts = _.extend({
            useShortcutFunctions: false,
            fixReturnType: false
        }, opts);
        var output = new CodeGen();
        var nameParam = '';
        if (name) {
            nameParam = JSON.stringify(name) + ', ';
        }
        var moduleName = 'templates';
        if (name) {
            moduleName = name;
        }

        var umdBegin = "(function(root, factory) {\n" +
            output.getIndent(1) + "if (typeof define === 'function' && define.amd) {\n" +
            output.getIndent(2) + "define(" + nameParam + "['jquery'], factory);\n" +
            output.getIndent(1) + "} else if (typeof exports === 'object') {\n" +
            output.getIndent(2) + "module.exports = factory(require('jquery'));\n" +
            output.getIndent(1) + "} else {\n" +
            output.getIndent(2) + "root." + moduleName + " = factory(jQuery);\n" +
            output.getIndent(1) + "}\n" +
            "})(this, function($) {";
        var umdEnd = "});";
        output.raw(umdBegin);
        output.incIndent();

        output.raw('var templates = {};');
        var paths = {'templates': true};
        memory = _.sortBy(memory, 'name');
        var useShortcutFunctions = false;
        var fixReturnType = true;
        memory.forEach(function (item) {
            var p = [];
            item.opts.name.forEach(function (n, i) {
                p.push(n);
                var v = CodeGen.normalizeName(p);
                if (paths[v]) {
                    return;
                }
                paths[v] = true;
                if (i + 1 == item.opts.name.length) {
                    return;
                }

                output.raw(v + ' = {};');
            });
            var compileOpts = _.extend({
                returnType: opts.returnType,
                trim: opts.trim,
                comment: opts.comment,
                fixReturnType: opts.fixReturnType,
                returnObject: opts.returnObject

            }, item.opts);
            compileOpts._useShortcutFunctions = opts.useShortcutFunctions;
            compileOpts._loader = opts._loader;

            if (compileOpts._useShortcutFunctions) {
                useShortcutFunctions = true;
            }
            if (!compileOpts.fixReturnType) {
                fixReturnType = false;
            }
            output.raw(jqfy.compile(item.html, compileOpts));
        });

        if (useShortcutFunctions) {
            defineShortCutFunctions(output, {fixReturnType: fixReturnType});
        }
        output.raw('return templates;');
        output.decIndent();
        output.raw(umdEnd);
        return output.getCode();
    };

    jqfy.flush = function () {
        memory = [];
    };
}

module.exports = new JQfy();
module.exports.version = version;