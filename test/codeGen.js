var expect = require('chai').expect;
var CodeGen = require('../lib/codeGen');

describe('CodeGen', function () {
    describe('#normalizeName()', function () {
        it('should return same string if input is string', function () {
            expect(CodeGen.normalizeName('t.x')).to.be.equals('t.x');
        });
        it('should return variable with dot notation when can', function () {
            expect(CodeGen.normalizeName(['t'])).to.be.equals('t');
            expect(CodeGen.normalizeName(['\\u0061'])).to.be.equals('\\u0061');
            expect(CodeGen.normalizeName(['t', '\\u0061'])).to.be.equals('t.\\u0061');
            expect(CodeGen.normalizeName(['t', 'x'])).to.be.equals('t.x');
            expect(CodeGen.normalizeName(['t', 'y', 'Salam'])).to.be.equals('t.y.Salam');
        });
        it('should return variable with bracket notation when can\'t use dot', function () {
            expect(CodeGen.normalizeName(['t', 'if'])).to.be.equals("t['if']");
            expect(CodeGen.normalizeName(['t', '12'])).to.be.equals("t['12']");
            expect(CodeGen.normalizeName(['t', '0x11'])).to.be.equals("t['0x11']");
            expect(CodeGen.normalizeName(['t', '011'])).to.be.equals("t['011']");
            expect(CodeGen.normalizeName(['t', '1t'])).to.be.equals("t['1t']");
            expect(CodeGen.normalizeName(['t', '\\u0048'])).to.be.equals('t.\\u0048');
            expect(CodeGen.normalizeName(['t', 12])).to.be.equals("t[12]");
            expect(CodeGen.normalizeName(['t', 0x11])).to.be.equals("t[17]");
            expect(CodeGen.normalizeName(['t', 011])).to.be.equals("t[9]");
        });
        it('should throw error when invalid variable name passed', function () {
            expect(function () {
                CodeGen.normalizeName(['if']);
            }).to.throw(/Invalid variable name/);
        });
        it('should throw error when invalid input passed. (not string or array of string)', function () {
            expect(function () {
                CodeGen.normalizeName({});
            }).to.throw(/Invalid input/);
            expect(function () {
                CodeGen.normalizeName(['x', {}]);
            }).to.throw(/Invalid input/);
        });
    });


    describe('.newLine() .inline(), .raw()', function () {
        var cg = new CodeGen();
        it('newLine should write new line', function () {
            cg.flush();
            cg.newLine();
            expect(cg.getCode()).to.be.equals('\n');
        });
        it('inline should write content without any extra whitespaces', function () {
            cg.flush();
            cg.inline('Hi');
            expect(cg.getCode()).to.be.equals('Hi');
        });
        it('raw should write content with new line', function () {
            cg.flush();
            cg.raw();
            expect(cg.getCode()).to.be.equals('\n');

            cg.flush();
            cg.raw('');
            expect(cg.getCode()).to.be.equals('\n');

            cg.flush();
            cg.raw('Hi');
            expect(cg.getCode()).to.be.equals('Hi\n');

            cg.flush();
            cg.raw('Hi\nBye');
            expect(cg.getCode()).to.be.equals('Hi\nBye\n');
        });
    });

    describe('.getIndent(n), .indent() .incIndent(), .decIndent()', function () {
        var cg = new CodeGen();
        it('getIndent should return repeated indent', function () {
            expect(cg.getIndent()).to.be.equals('    ');
            expect(cg.getIndent(0)).to.be.equals('');
            expect(cg.getIndent(1)).to.be.equals('    ');
            expect(cg.getIndent(3)).to.be.equals('            ');

            cg.flush();
            cg.newLine();
            expect(cg.getCode()).to.be.equals('\n');
        });

        it('indent should write repeated indent, incIndent(), decIndent() must change indent length', function () {
            cg.flush();
            cg.indent();
            expect(cg.getCode()).to.be.equals('');

            cg.flush();
            cg.incIndent();
            cg.indent();
            expect(cg.getCode()).to.be.equals('    ');

            cg.flush();
            cg.incIndent();
            cg.raw('x');
            cg.raw('');
            cg.decIndent();
            cg.raw('x');
            expect(cg.getCode()).to.be.equals('    x\n    \nx\n');
        });
    });

    describe('.comment()', function () {
        var cg = new CodeGen();
        it('comment should write comment', function () {
            cg.flush();
            cg.comment('x');
            expect(cg.getCode()).to.be.equals('// x\n');

            cg.flush();
            cg.comment('x\ny');
            expect(cg.getCode()).to.be.equals('// x\n// y\n');
        });
    });

    describe('function generator', function () {
        var cg = new CodeGen();
        it('function should write function start and end', function () {
            cg.flush();
            cg.startFunction();
            cg.endFunction();
            expect(cg.getCode()).to.be.equals('function () {\n}\n');

            cg.flush();
            cg.startFunction('');
            cg.endFunction();
            expect(cg.getCode()).to.be.equals('function () {\n}\n');

            cg.flush();
            cg.startFunction('x');
            cg.endFunction();
            expect(cg.getCode()).to.be.equals('function x() {\n}\n');

            cg.flush();
            cg.startFunction('x.y');
            cg.endFunction();
            expect(cg.getCode()).to.be.equals('x.y = function () {\n};\n');

            cg.flush();
            cg.startFunction('x[1]');
            cg.endFunction();
            expect(cg.getCode()).to.be.equals('x[1] = function () {\n};\n');

        });

        it('function should write function start and end (with argument)', function () {
            cg.flush();
            cg.startFunction('', ['x']);
            cg.endFunction();
            expect(cg.getCode()).to.be.equals('function (x) {\n}\n');

            cg.flush();
            cg.startFunction('', ['x', 'y']);
            cg.endFunction();
            expect(cg.getCode()).to.be.equals('function (x, y) {\n}\n');

            cg.flush();
            cg.startFunction('x', ['x', 'y']);
            cg.endFunction();
            expect(cg.getCode()).to.be.equals('function x(x, y) {\n}\n');

            cg.flush();
            cg.startFunction('x.y', ['x', 'y']);
            cg.endFunction();
            expect(cg.getCode()).to.be.equals('x.y = function (x, y) {\n};\n');

            cg.flush();
            cg.startFunction('x[1]', ['x', 'y']);
            cg.endFunction();
            expect(cg.getCode()).to.be.equals('x[1] = function (x, y) {\n};\n');

        });

        it('function should support inner function ', function () {
            cg.flush();
            cg.startFunction('x.y', ['a', 'b']);
            cg.startFunction('z', ['c', 'd']);
            cg.endFunction();
            cg.endFunction();
            expect(cg.getCode()).to.be.equals('x.y = function (a, b) {\n    function z(c, d) {\n    }\n};\n');

        });

        it('function should support inner function ', function () {
            cg.flush();
            cg.startFunction('x.y', ['a', 'b']);
            cg.startFunction('z', ['c', 'd']);
            cg.endFunction();
            cg.endFunction();
            expect(cg.getCode()).to.be.equals('x.y = function (a, b) {\n    function z(c, d) {\n    }\n};\n');

        });
    });

    describe('switch case generator', function () {
        var cg = new CodeGen();
        it('switch case tools codes and indentation', function () {
            cg.flush();
            cg.flush();
            cg.startSwitch('x.y');
            cg.writeCase('a');
            cg.writeCase(2);
            cg.raw('console.log("ab");');
            cg.writeBreak();
            cg.writeCase('c');
            cg.raw('console.log("cd");');
            cg.writeBreak();
            cg.writeDefault();
            cg.raw('console.log("none");');
            cg.endSwitch();

            expect(cg.getCode()).to.be.equals('switch (x.y) {\n' +
            '    case "a":\n' +
            '    case 2:\n' +
            '        console.log("ab");\n' +
            '        break;\n' +
            '    case "c":\n' +
            '        console.log("cd");\n' +
            '        break;\n' +
            '    default :\n' +
            '        console.log("none");\n' +
            '}\n');

        });
    });

});