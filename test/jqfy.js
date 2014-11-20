var expect = require('chai').expect;
var jqfy = require('../index');
var phantom = require('phantom');


function PhantomTester(html) {

    var tester = this;
    var defaultHtml = '<!doctype HTML><html>' +
        '<head><title>title</title></head>' +
        '<body><p>Hello world</p></body>' +
        '</html>';

    tester.resetHtml = function () {
        tester.html = defaultHtml;
        if (html) {
            tester.html = html;
        }
    };
    tester.resetHtml();

    tester.test = function (fn, cb, data) {
        phantom.create(function (ph) {
            ph.createPage(function (page) {
                page.setContent(tester.html);
                page.injectJs('node_modules/jquery/dist/jquery.js', function () {
                    page.evaluate(fn, function (result) {
                        cb(result);
                        ph.exit();
                    }, data);
                });
            });
        });
    };

    tester.testInjectedCode = function (fn, cb, js, data) {
        phantom.create(function (ph) {
            ph.createPage(function (page) {
                page.setContent(tester.html);
                page.injectJs('node_modules/jquery/dist/jquery.js', function () {
                    page.evaluate(function (js) {
                        /*jslint browser: true*/
                        /*global $ */
                        $('<script></script>').html(js).appendTo('body');
                    }, function () {
                        page.evaluate(fn, function (result) {
                            cb(result);
                            ph.exit();
                        }, data);
                    }, js);
                });
            });
        });
    };
}

describe('phantom tester', function () {
    var phantomTester = new PhantomTester();

    it('simple', function (done) {
        phantomTester.test(function (data) {
            /*jslint browser: true*/
            return 'Hello ' + data.name;
        }, function (result) {
            expect(result).to.be.equals('Hello world');
            done();
        }, {name: 'world'});
    });

    it('dom', function (done) {
        phantomTester.test(function () {
            /*jslint browser: true*/
            return document.title;
        }, function (result) {
            expect(result).to.be.equals('title');
            done();
        });
    });

    it('jquery', function (done) {
        phantomTester.test(function () {
            /*jslint browser: true*/
            /*global $ */
            return $('p').text();
        }, function (result) {
            expect(result).to.be.equals('Hello world');
            done();
        });
    });

    it('inject', function (done) {
        phantomTester.testInjectedCode(function () {
            /*jslint browser: true*/
            /*global $ */
            return $('p').text();
        }, function (result) {
            expect(result).to.be.equals('Hi world');
            done();
        }, "$('p').text('Hi world');");
    });

});

describe('jQfy', function () {
    describe('static test', function () {
        // TODO
    });
    describe('execution test', function () {
        var phantomTester = new PhantomTester();
        describe('tags', function () {
            it('simple tag', function (done) {
                var code = jqfy.compile('<div></div>', {name: 'x'});
                phantomTester.testInjectedCode(function () {
                    /*jslint browser: true*/
                    /*global $ */
                    /*global x */

                    return x({}, {returnType: 'html'});
                }, function (result) {
                    expect(result).to.be.equals('<div></div>');
                    done();
                }, code);
            });

            it('pre tag', function (done) {
                var html = '<pre>' +
                    'if x:\n' +
                    '    print x\n' +
                    '</pre>';
                var code = jqfy.compile(html, {name: 'x'});
                phantomTester.testInjectedCode(function () {
                    /*jslint browser: true*/
                    /*global $ */
                    /*global x */
                    x().appendTo('body');
                    return $('pre:first').text();
                }, function (result) {
                    expect(result).to.be.equals('if x:\n    print x\n');
                    done();
                }, code);
            });

            it('pre code tag', function (done) {
                var html = '<pre>' +
                    '<code>if x:</code>\n' +
                    '<code>    print x</code>\n' +
                    '</pre>';
                var code = jqfy.compile(html, {name: 'x'});
                phantomTester.testInjectedCode(function () {
                    /*jslint browser: true*/
                    /*global $ */
                    /*global x */
                    x().appendTo('body');
                    return $('pre:first').text();
                }, function (result) {
                    expect(result).to.be.equals('if x:\n    print x\n');
                    done();
                }, code);
            });

            it('comment', function (done) {
                var code = jqfy.compile('<!-- x -->', {name: 'x'});
                phantomTester.testInjectedCode(function () {
                    /*jslint browser: true*/
                    /*global $ */
                    /*global x */

                    return x({}, {returnType: 'html'});
                }, function (result) {
                    expect(result).to.be.equals('<!-- x -->');
                    done();
                }, code);
            });
        });

        describe('attributes', function () {
            it('id', function (done) {

                var code = jqfy.compile('<div id="d"></div>', {name: 'x'});
                phantomTester.testInjectedCode(function () {
                    /*jslint browser: true*/
                    /*global $ */
                    /*global x */
                    x().appendTo('body');
                    return $('div:first').attr('id');
                }, function (result) {
                    expect(result).to.be.equals('d');
                    done();
                }, code);
            });

            it('class', function (done) {
                var code = jqfy.compile('<div class="panel"></div>', {name: 'x'});
                phantomTester.testInjectedCode(function () {
                    /*jslint browser: true*/
                    /*global $ */
                    /*global x */
                    x().appendTo('body');
                    return $('div:first').attr('class');
                }, function (result) {
                    expect(result).to.be.equals('panel');
                    done();
                }, code);
            });

            it('attr', function (done) {
                var code = jqfy.compile('<div data-target=".panel"></div>', {name: 'x'});
                phantomTester.testInjectedCode(function () {
                    /*jslint browser: true*/
                    /*global $ */
                    /*global x */
                    x().appendTo('body');
                    return $('div:first').data('target');
                }, function (result) {
                    expect(result).to.be.equals('.panel');
                    done();
                }, code);
            });

            it('jqfy:name', function (done) {
                var code = jqfy.compile('<div jqfy:name="myDiv"></div><script>myDiv.addClass("panel");</script>', {name: 'x'});
                phantomTester.testInjectedCode(function () {
                    /*jslint browser: true*/
                    /*global $ */
                    /*global x */
                    x().appendTo('body');
                    return $('div:first').attr('class');
                }, function (result) {
                    expect(result).to.be.equals('panel');
                    done();
                }, code);
            });
        });

        describe('options', function () {
            it('trim true (default)', function (done) {
                var code = jqfy.compile('<div>\n    x\n</div>', {name: 'x'});
                phantomTester.testInjectedCode(function () {
                    /*jslint browser: true*/
                    /*global $ */
                    /*global x */

                    return x({}, {returnType: 'html'});
                }, function (result) {
                    expect(result).to.be.equals('<div>x</div>');
                    done();
                }, code);
            });

            it('trim false', function (done) {
                var code = jqfy.compile('<div>\n    x\n</div>', {name: 'x',trim: false});
                phantomTester.testInjectedCode(function () {
                    /*jslint browser: true*/
                    /*global $ */
                    /*global x */

                    return x({}, {returnType: 'html'});
                }, function (result) {
                    expect(result).to.be.equals('<div>\n    x\n</div>');
                    done();
                }, code);
            });

            it('comment true (default)', function (done) {
                var code = jqfy.compile('<!-- x -->', {name: 'x'});
                phantomTester.testInjectedCode(function () {
                    /*jslint browser: true*/
                    /*global $ */
                    /*global x */

                    return x({}, {returnType: 'html'});
                }, function (result) {
                    expect(result).to.be.equals('<!-- x -->');
                    done();
                }, code);
            });

            it('comment false', function (done) {
                var code = jqfy.compile('<!-- x -->', {name: 'x',comment: false});
                phantomTester.testInjectedCode(function () {
                    /*jslint browser: true*/
                    /*global $ */
                    /*global x */

                    return x({}, {returnType: 'html'});
                }, function (result) {
                    expect(result).to.be.equals('');
                    done();
                }, code);
            });
        });
        // TODO many other tests
    });
});