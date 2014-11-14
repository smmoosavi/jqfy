var expect = require('chai').expect;
var jqfy = require('../index');

describe('jQfy', function () {
    var base = '<div>x</div>\n';
    var script = '<script>\n' +
        '$div1\n' +
        '    .on("click",function(){\n' +
        '        console.log("<div></div>");\n' +
        '    });\n' +
        '</script>';
    var html = base + script;
    var code = jqfy.compile(html);
    //console.log(html);
    //console.log('=================');
    //console.log(code);
});