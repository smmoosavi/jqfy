var util = require('util');

function CodeGen() {
    var cg = this;
    var indentationStr = '    ';
    var newLineStr = '\n';
    var indentCount = 0;
    var code = '';

    cg.newLine = function () {
        code += newLineStr;
    };

    cg.incIndent = function () {
        indentCount++;
    };

    cg.decIndent = function () {
        indentCount--;
    };

    cg.indent = function () {
        code += new Array(indentCount + 1).join(indentationStr);
    };

    cg.inline = function(line){
        code += line;
    };

    cg.raw = function (lines, indenting) {
        if (lines == undefined) {
            lines = '';
        }
        if (indenting == undefined) {
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

    cg.functionStart = function (name) {
        if (name) {
            cg.raw(util.format('function %s($) {', name));
        } else {
            cg.raw('function ($) {');
        }
        cg.incIndent();
    };

    cg.functionEnd = function () {
        cg.decIndent();
        cg.raw('}');

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