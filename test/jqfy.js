//var expect = require('chai').expect;
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
    jqfy.append(html, {'name': 'x', returnType: 'html'});
    jqfy.append('<div>x</div>', {'name': 'y', fixReturnType: false});
    var code = jqfy.getCode('ooo', {useShortcutFunctions: false, fixReturnType: true});
    console.log(html);
    console.log('=================');
    console.log(code);
});