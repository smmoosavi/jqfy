var expect = require('chai').expect;
var jqfy = require('../index');

describe('jQfy', function () {
    var base = '<div>x</div>\n';
    var script = '<!-- scripts-->\n' +
        '<script>\n' +
        '$div1\n' +
        '    .on("click",function(){\n' +
        '        console.log("<div></div>");\n' +
        '    });\n' +
        '</script>';
    var html = base + script;
    jqfy.append(html, {'name': 'x'});
    var code = jqfy.getCode();
    console.log(html);
    console.log('=================');
    console.log(code);
});