var util = require('util');

function CodeGen() {
    var cg = this;
    var indentationStr = '    ';
    var newLineStr = '\n';
    var indentCount = 0;
    var code = '';

    var semiColonEndFunction = false;

    cg.newLine = function () {
        code += newLineStr;
    };

    cg.incIndent = function () {
        indentCount++;
    };

    cg.decIndent = function () {
        indentCount--;
    };

    cg.getIndent = function (n) {
        return new Array(n + 1).join(indentationStr);
    };

    cg.indent = function () {
        code += cg.getIndent(indentCount);
    };

    cg.inline = function (line) {
        code += line;
    };

    cg.raw = function (lines, indenting) {
        if (lines === undefined) {
            lines = '';
        }
        if (indenting === undefined) {
            indenting = true;
        }

        lines.split('\n').forEach(function (line) {
            if (indenting) {
                cg.indent();
            }
            cg.inline(line);
            cg.newLine();
        });
    };

    cg.functionStart = function (name, args) {
        if (args === undefined) {
            args = [];
        }
        var argsStr = args.join(', ');
        if (name) {
            if (name.indexOf('.') == -1 && name.indexOf('[') == -1) {
                cg.raw(util.format('function %s(%s) {', name, argsStr));
            } else {
                cg.raw(util.format('%s = function (%s) {', name, argsStr));
                semiColonEndFunction = true;
            }

        } else {
            cg.raw(util.format('function (%s) {', argsStr));
        }
        cg.incIndent();
    };

    cg.functionEnd = function () {
        cg.decIndent();
        if (semiColonEndFunction) {
            cg.raw('};');
        } else {
            cg.raw('}');
        }
        semiColonEndFunction = false;

    };

    cg.comment = function (text) {
        var texts = text.split('\n');
        texts.forEach(function (t) {
            cg.raw('// ' + t);
        });

    };

    cg.getCode = function () {
        return code;
    };


}

module.exports = CodeGen;