const puppeteer = require('puppeteer');
const {expect} = require('chai');
const jqfy = require('../index');

const opts = {
    timeout: 20000
};

let defaultHtml = `
<!doctype HTML>
<html>
  <head>
    <title>title</title>
  </head>
  <body>
    <p>Hello world</p>
  </body>
</html>
`;


class Tester {
    constructor(html = defaultHtml) {
        this.html = html;
    }

    async start() {
        this.browser = await puppeteer.launch(opts);
        this.page = await this.browser.newPage();
    }

    async resetPage() {
        await this.page.goto(`data:text/html,${this.html}`, {waitUntil: 'networkidle0'});
        await this.page.addScriptTag({path: 'node_modules/jquery/dist/jquery.js'});
    }

    async stop() {
        await this.page.close();
        await this.browser.close();
    }
}

describe('puppeteer tester', function () {

    let tester;
    let page;
    let browser;

    before(async function () {
        tester = new Tester();
        await tester.start();
        page = tester.page;
        browser = tester.browser;
    });

    beforeEach(async function () {
        await tester.resetPage();
    })

    after(async function () {
        await tester.stop()
    });

    it('should work', async function () {
        console.log(await browser.version());

        expect(true).to.be.true;
    });

    it('simple', async function () {
        const result = await page.evaluate(function (data) {
            /*jslint browser: true*/
            return 'Hello ' + data.name;
        }, {name: 'world'});
        expect(result).to.be.equals('Hello world');
    });

    it('dom', async function () {
        const result = await page.evaluate(function () {
            /*jslint browser: true*/
            return document.title;
        });
        expect(result).to.be.equals('title');

    });

    it('jquery', async function () {
        const result = await page.evaluate(function () {
            /*jslint browser: true*/
            /*global $ */
            return $('p').text();
        });
        expect(result).to.be.equals('Hello world');
    });

    it('inject', async function () {
        const js = "$('p').text('Hi world');";
        await page.addScriptTag({content: js});
        const result = await page.evaluate(function () {
            /*jslint browser: true*/
            /*global $ */
            return $('p').text();
        });
        expect(result).to.be.equals('Hi world');
    });

});

describe('jQfy', function () {
    describe('execution test', function () {
        let tester;
        let page;
        let browser;

        before(async function () {
            let html = `
<!doctype HTML>
<html>
  <head></head>
  <body></body>
</html>
`
            tester = new Tester(html);
            await tester.start();
            page = tester.page;
            browser = tester.browser;
        });


        beforeEach(async function () {
            await tester.resetPage();
        })

        after(async function () {
            await tester.stop();
        });

        describe('tags', function () {
            it('simple tag', async function () {
                const code = jqfy.compile('<div></div>', {name: 'x'});
                await page.addScriptTag({content: code});
                const result = await page.evaluate(function () {
                    /*jslint browser: true*/
                    /*global $ */
                    /*global x */
                    return x({}, {returnType: 'html'});
                });
                expect(result).to.be.equals('<div></div>');
            });

            it('pre tag', async function () {
                const html = '<pre>' +
                    'if x:\n' +
                    '    print x\n' +
                    '</pre>';
                const code = jqfy.compile(html, {name: 'x'});
                await page.addScriptTag({content: code});
                const result = await page.evaluate(function () {
                    /*jslint browser: true*/
                    /*global $ */
                    /*global x */
                    x().appendTo('body');
                    return $('pre:first').text();
                });
                expect(result).to.be.equals('if x:\n    print x\n');
            });

            it('pre code tag', async function () {
                const html = '<pre>' +
                    '<code>if x:</code>\n' +
                    '<code>    print x</code>\n' +
                    '</pre>';
                const code = jqfy.compile(html, {name: 'x'});
                await page.addScriptTag({content: code});
                const result = await page.evaluate(function () {
                    /*jslint browser: true*/
                    /*global $ */
                    /*global x */
                    x().appendTo('body');
                    return $('pre:first').text();
                });
                expect(result).to.be.equals('if x:\n    print x\n');
            });

            it('comment', async function () {
                const code = jqfy.compile('<!-- x -->', {name: 'x'});
                await page.addScriptTag({content: code});
                const result = await page.evaluate(function () {
                    /*jslint browser: true*/
                    /*global $ */
                    /*global x */
                    return x({}, {returnType: 'html'});
                });
                expect(result).to.be.equals('<!-- x -->');
            });
        });

        describe('attributes', function () {
            it('id', async function () {

                const code = jqfy.compile('<div id="d"></div>', {name: 'x'});
                await page.addScriptTag({content: code});

                const result = await page.evaluate(function () {
                    /*jslint browser: true*/
                    /*global $ */
                    /*global x */
                    x().appendTo('body');
                    return $('div:first').attr('id');
                });
                expect(result).to.be.equals('d');
            });

            it('class', async function () {
                const code = jqfy.compile('<div class="panel"></div>', {name: 'x'});
                await page.addScriptTag({content: code});

                const result = await page.evaluate(function () {
                    /*jslint browser: true*/
                    /*global $ */
                    /*global x */
                    x().appendTo('body');
                    return $('div:first').attr('class');
                });
                expect(result).to.be.equals('panel');
            });

            it('attr', async function () {
                const code = jqfy.compile('<div data-target=".panel"></div>', {name: 'x'});
                await page.addScriptTag({content: code});

                const result = await page.evaluate(function () {
                    /*jslint browser: true*/
                    /*global $ */
                    /*global x */
                    x().appendTo('body');
                    return $('div:first').data('target');
                });
                expect(result).to.be.equals('.panel');
            });

            it('jqfy:name', async function () {
                const code = jqfy.compile('<div jqfy:name="myDiv"></div><script>myDiv.addClass("panel");</script>', {name: 'x'});
                await page.addScriptTag({content: code});

                const result = await page.evaluate(function () {
                    /*jslint browser: true*/
                    /*global $ */
                    /*global x */
                    x().appendTo('body');
                    return $('div:first').attr('class');
                });
                expect(result).to.be.equals('panel');
            });
        });

        describe('options', function () {
            it('trim true (default)', async function () {
                const code = jqfy.compile('<div>\n    x\n</div>', {name: 'x'});
                await page.addScriptTag({content: code});

                const result = await page.evaluate(function () {
                    /*jslint browser: true*/
                    /*global $ */
                    /*global x */

                    return x({}, {returnType: 'html'});
                })
                expect(result).to.be.equals('<div> x </div>');
            });
            it('trim true (default)', async function () {
                const code = jqfy.compile('<div>\n    x</div>', {name: 'x'});
                await page.addScriptTag({content: code});

                const result = await page.evaluate(function () {
                    /*jslint browser: true*/
                    /*global $ */
                    /*global x */

                    return x({}, {returnType: 'html'});
                })
                expect(result).to.be.equals('<div> x</div>');
            });
            it('trim true (default)', async function () {
                const code = jqfy.compile('<div>x\n</div>', {name: 'x '});
                await page.addScriptTag({content: code});

                const result = await page.evaluate(function () {
                    /*jslint browser: true*/
                    /*global $ */
                    /*global x */

                    return x({}, {returnType: 'html'});
                })
                expect(result).to.be.equals('<div>x </div>');

            });
            it('trim true (default)', async function () {
                const code = jqfy.compile('<div>\n   \t\n</div>', {name: 'x '});
                await page.addScriptTag({content: code});

                const result = await page.evaluate(function () {
                    /*jslint browser: true*/
                    /*global $ */
                    /*global x */

                    return x({}, {returnType: 'html'});
                })
                expect(result).to.be.equals('<div> </div>');

            });

            it('trim false', async function () {
                const code = jqfy.compile('<div>\n    x\n</div>', {name: 'x', trim: false});
                await page.addScriptTag({content: code});

                const result = await page.evaluate(function () {
                    /*jslint browser: true*/
                    /*global $ */
                    /*global x */

                    return x({}, {returnType: 'html'});
                })
                expect(result).to.be.equals('<div>\n    x\n</div>');

            });

            it('comment true (default)', async function () {
                const code = jqfy.compile('<!-- x -->', {name: 'x'});
                await page.addScriptTag({content: code});

                const result = await page.evaluate(function () {
                    /*jslint browser: true*/
                    /*global $ */
                    /*global x */

                    return x({}, {returnType: 'html'});
                })
                expect(result).to.be.equals('<!-- x -->');

            });

            it('comment false', async function () {
                const code = jqfy.compile('<!-- x -->', {name: 'x', comment: false});
                await page.addScriptTag({content: code});

                const result = await page.evaluate(function () {
                    /*jslint browser: true*/
                    /*global $ */
                    /*global x */

                    return x({}, {returnType: 'html'});
                })
                expect(result).to.be.equals('');

            });
        });
    });
});