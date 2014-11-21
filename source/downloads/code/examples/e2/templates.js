(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define("templates", ['jquery'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('jquery'));
    } else {
        root.templates = factory(jQuery);
    }
})(this, function($) {
    var templates = {};
    templates.item = function (data, opts) {
        // generated by jQfy 1.3.7
        opts = $.extend({}, opts);
        data = $.extend({}, data);
        var $root = $('<div/>');
        
        var $li1 = $('<li/>')
            .addClass("list-group-item")
            .appendTo($root);
        
        var $removeBtn = $('<button/>')
            .addClass("btn btn-danger btn-xs stick-top stick-right")
            .attr("type", "button")
            .appendTo($li1);
        
        var $span1 = $('<span/>')
            .addClass("glyphicon glyphicon-remove")
            .appendTo($removeBtn);
        //    end $span1
        //   end $removeBtn
        
        var $textSpan = $('<span/>')
            .appendTo($li1);
        $textSpan.append(document.createTextNode("" + (data.text == undefined ? "" : data.text) + ""));
        //   end $textSpan
        
        var $div1 = $('<div/>')
            .addClass("clearfix")
            .appendTo($li1);
        //   end $div1
        //  end $li1
        
        // start script 1
        
            if (data.text.trim() == '') {        // if text is empty
                $textSpan.html('&nbsp;');           // prevent collapse
            }
            $removeBtn.on('click', function () {
                output.remove();                 // remove item when remove btn clicked
            });
        
        //  end script 1
        
        // end $root
        var output = $root.contents();
        return output;
    };
    
    templates.list = function (data, opts) {
        // generated by jQfy 1.3.7
        opts = $.extend({}, opts);
        data = $.extend({}, data);
        var $root = $('<div/>');
        
        var $div1 = $('<div/>')
            .addClass("panel panel-default")
            .appendTo($root);
        
        var $div2 = $('<div/>')
            .addClass("panel-body")
            .appendTo($div1);
        
        var $div3 = $('<div/>')
            .addClass("input-group")
            .appendTo($div2);
        
        var $textInput = $('<input/>')
            .addClass("form-control")
            .attr("type", "text")
            .appendTo($div3);
        //     end $textInput
        
        var $span1 = $('<span/>')
            .addClass("input-group-btn")
            .appendTo($div3);
        
        var $addBtn = $('<button/>')
            .addClass("btn btn-success")
            .attr("type", "button")
            .appendTo($span1);
        $addBtn.append(document.createTextNode("add"));
        //      end $addBtn
        //     end $span1
        //    end $div3
        //   end $div2
        
        var $list = $('<ul/>')
            .addClass("list-group")
            .appendTo($div1);
        //   end $list
        //  end $div1
        
        // start script 1
        
            $addBtn.on('click', function (e) {
                var text = $textInput.val();        // get input value
                $textInput.val('');                 // empty input
                templates
                        .item({text: text})      // render new item
                        .appendTo($list);         // append item to list
            });
        
        //  end script 1
        
        // end $root
        var output = $root.contents();
        return output;
    };
    
    return templates;
});
