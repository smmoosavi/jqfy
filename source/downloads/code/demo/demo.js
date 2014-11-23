$(function () {
    var $output = $('#output');
    var returnType = 'children';
    var trim = true;
    var comment = true;
    var useShortcutFunctions = false;
    var fixReturnType = false;
    var returnObject = false;
    var code = '';
    var umdName = '';

    function _loader(src, _path) {
        var jsFile = '';
        if (src.indexOf('/') === 0) {
            jsFile = path.join('/', src);
        } else {
            jsFile = path.resolve(path.dirname(_path), src);
        }
        jsFile = jsFile.substr(1);
        var output = null;
        $('#inputs')
            .find('[data-input-div]')
            .each(function (i, e) {
                var $e = $(e);
                var $input = $e.find('[data-code]');
                var $path = $e.find('[data-name-input]');
                var _path = $path.val();
                if (_path == jsFile) {
                    output = $input.val();
                }
            });
        if (output == null) {
            output = '// ERROR js file not found: ' + jsFile;
        }
        return output;
    }

    function update() {
        jqfy.flush();
        $('#inputs')
            .find('[data-input-div]')
            .each(function (i, e) {
                var $e = $(e);
                var $input = $e.find('[data-code]');
                var $path = $e.find('[data-name-input]');
                var path = $path.val();
                var html = $input.val();
                var name = path.replace(/\.html$/, "");
                if (name != path) {
                    name = name.split('/');
                    jqfy.append(html, {name: name, _path: path});
                }
            });
        code = jqfy.getCode(umdName, {
            returnType: returnType,
            trim: trim,
            comment: comment,
            fixReturnType: fixReturnType,
            returnObject: returnObject,
            useShortcutFunctions: useShortcutFunctions,
            _loader: _loader
        });
        $output.text(code);
        hljs.highlightBlock($output[0]);
    }

    function init() {
        var text = '<div class="row">\n' +
            '    <div class="col-md-offset-1 col-md-5 col-sm-6">\n' +
            '        <textarea class="form-control" id="input"></textarea>\n' +
            '    </div>\n' +
            '    <div class="col-md-5 col-sm-6">\n' +
            '        example: <br>\n' +
            '        <pre id="output">test  </pre>\n' +
            '    </div>\n' +
            '</div>\n';
        addInput('jQfy.html', '<div class="text-success">jQfy</div>');
        addInput('test/demo.html', text);
    }

    init();
    update();
    $('[name="return-type"]:radio').on('change', function () {
        returnType = $(this).val();
        update();
    });
    $('#trim-chb')
        .on('change', function () {
            trim = $(this).prop('checked');
            update();
        });
    $('#comment-chb')
        .on('change', function () {
            comment = $(this).prop('checked');
            update();
        });
    $('#use-shortcut-functions-chb')
        .on('change', function () {
            useShortcutFunctions = $(this).prop('checked');
            update();
        });
    $('#fix-return-type-chb')
        .on('change', function () {
            fixReturnType = $(this).prop('checked');
            update();
        });
    $('#return-object-chb')
        .on('change', function () {
            returnObject = $(this).prop('checked');
            update();
        });
    $('#umd-name-input')
        .on('keyup', function () {
            umdName = $(this).val();
            setTimeout(update, 100);
        });
    $('#inputs')
        .on('keyup', 'input,textarea', function () {
            setTimeout(update, 100);
        });

    function addInput(name, code) {
        var $input = demoTemplates.input({
            code: code,
            name: name,
            onRemove: update
        }).appendTo('#inputs');
    }

    $('#add-input-btn')
        .on('click', function () {
            var r = parseInt(Math.random() * 10000);
            addInput(r + '.html', '');
            update();
        });

    jQuery.fn.selectText = function () {
        var doc = document, element = this[0], range, selection
            ;
        if (doc.body.createTextRange) {
            range = document.body.createTextRange();
            range.moveToElementText(element);
            range.select();
        } else if (window.getSelection) {
            selection = window.getSelection();
            range = document.createRange();
            range.selectNodeContents(element);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    };

    $output.on('dblclick', function () {
        $output.selectText();
    });

});