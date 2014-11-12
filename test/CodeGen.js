var expect = require('chai').expect;
var CodeGen = require('../lib/codeGen');

describe('CodeGen', function () {
    describe('#normalizeName()', function () {
        it('should return same string if input is string', function () {
            expect(CodeGen.normalizeName('t.x')).to.be.equals('t.x');
        });
        it('should return variable with dot notation when can', function () {
            expect(CodeGen.normalizeName(['t', 'x'])).to.be.equals('t.x');
            expect(CodeGen.normalizeName(['t', 'y', 'Salam'])).to.be.equals('t.y.Salam');
        });
        it('should return variable with bracket notation when can\'t use dot', function () {
            expect(CodeGen.normalizeName(['t', 'if'])).to.be.equals("t['if']");
            expect(CodeGen.normalizeName(['t', '12'])).to.be.equals("t['12']");
            expect(CodeGen.normalizeName(['t', '1t'])).to.be.equals("t['1t']");
            expect(CodeGen.normalizeName(['t', 12])).to.be.equals("t[12]");
        });
        it('should throw error when invalid variable name passed', function () {
            expect(function () {
                CodeGen.normalizeName(['if']);
            }).to.throw(/invalid variable name/);
        });
    });
});