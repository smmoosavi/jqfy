var _ = require('lodash');
var version = require('../package.json').version;
var CodeGen = require('./codeGen');
var cheerio = require('cheerio');

function JQfy() {
    var jqfy = this;
    var shortCutFunctions = false;

    function defineShortCutFunctions(cg) {
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

    function writeCreateTextNode(cg, parent, text) {
        var value = JSON.stringify(text);
        if (shortCutFunctions) {
            cg.rawFormat('%s.append(_TEX(%s));', parent, value);
        } else {
            cg.rawFormat('%s.append(document.createTextNode(%s));', parent, value);
        }
    }

    function writeCreateComment(cg, parent, text) {
        var comment = JSON.stringify(text);
        if (shortCutFunctions) {
            cg.rawFormat('%s.append(_COM(%s));', parent, comment);
        } else {
            cg.rawFormat('%s.append(document.createComment(%s));', parent, comment);
        }
    }

    function writeOutput(cg, returnType) {
        if (shortCutFunctions) {
            cg.rawFormat('var output = _OUTPUT($root, %s, %s);', JSON.stringify(returnType), 'opts.returnType');
        } else {
            cg.raw('var output = null;');
            var d = "";
            switch (returnType) {
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
            }

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
    }

    jqfy.compile = function (html, opts) {
        opts = _.extend({
            returnType: 'contents', // html, root, contents [children is deprecated]
            name: '', // string or array of string,
            trim: true, // true, false
            comment: true // true, false
        }, opts);
        if (opts.returnType == 'children') {// TODO remove in version 2.*
            opts.returnType = 'contents';
        }
        var name = CodeGen.normalizeName(opts.name);
        var cg = new CodeGen();
        var commentIndent = 0;
        var counts = {};

        function generate(node, parentCtx) {
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
                    cg.rawFormat('.attr(%s, %s)', JSON.stringify('id'), JSON.stringify(node.attribs.id));
                }

                if (node.attribs['class']) {
                    cg.rawFormat('.addClass(%s)', JSON.stringify(node.attribs['class']));
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
                    cg.rawFormat('.attr(%s, %s)', JSON.stringify(a), JSON.stringify(v));
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
                    text = text.trim();
                }

                if (text) {
                    writeCreateTextNode(cg, parentCtx.parent, text);
                }
            }
            if (node.type == 'comment') {
                if (opts.comment) {
                    writeCreateComment(cg, parentCtx.parent, node.data);
                }
            }
            if (node.type == 'script') {
                if (counts.script === undefined) {
                    counts.script = 1;
                }
                if (node.children && node.children[0]) {
                    cg.raw();
                    var startScript = 'start script ' + counts.script;
                    var endScript = ' end script ' + counts.script;
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

        var ch = cheerio.load(html);

        cg.startFunction(name, ['data', 'opts']);
        cg.comment('generated by jQfy ' + version);

        cg.raw('opts = $.extend({}, opts);');
        cg.raw('data = $.extend({}, data);');

        cg.raw("var $root = $('<div/>');");
        generate(ch._root);

        writeOutput(cg, opts.returnType);

        cg.raw('return output;');
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
            useShortcutFunctions: false
        }, opts);
        if (opts.useShortcutFunctions) {
            shortCutFunctions = true;
        }
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
            output.raw(jqfy.compile(item.html, item.opts));
        });

        if (opts.useShortcutFunctions) {
            defineShortCutFunctions(output);
            shortCutFunctions = false;
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