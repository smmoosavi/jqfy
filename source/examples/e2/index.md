title: 'Example 2: Dynamic list'
date: 2014-11-22 01:41:22
---

## Compile html files to js

```bash
$ jqfy -i templates/ -o templates.js --fix-return-type

compile templates/item.html
compile templates/list.html
```

By jqfy command we compile [html templates](#html_templates) to [templates.js](../../downloads/code/examples/e2/templates.js)

# Create new list

```html index.html
<script src="jquery.min.js"></script>
<script src="templates.js"></script>
<script>
    $(function () {
        templates.list().appendTo('#example');
    });
</script>
<div id="example"></div>
```

# Result

Now we have an input and button. by clicking on the button, a list item with text of input will be added.  

{# {% jsfiddle mkp8djbb result,js,html,css %} #}
{% codepen smmoosavi azzXxg 7928 %}

We have two [html templates](#html_templates).  `templates/list.html` and `templates/item.html`. 

# html templates

{% include_code templates/list.html lang:js examples/e2/templates/list.html %}

{% include_code templates/item.html lang:js examples/e2/templates/item.html %}

# Generated template.js

{% include_code templates/item.html lang:js examples/e2/templates.js %}

# And some extra css

```css
.stick-right {
    float: right;
    margin-right: -15px;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
}

.stick-top {
    margin-top: -10px;
    border-top-right-radius: 0;
    border-top-left-radius: 0;
}

.stick-left {
    float: left;
    margin-left: -15px;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
}

#example {
  margin: 10px;
  max-width: 350px;
  margin-left: auto;
  margin-right: auto;
}

body{
  background-color: #EDE7F6;
}

```