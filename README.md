# Knockoff

  Reactive data binding component with syntax partially compatible with knockoutjs

## Installation

    $ component install karlbohlmark/knockoff

## Example

  Given a template node:

```html
    <form id="my-template-root" action="/action">
        <input data-bind="value: firstname">
    </form>
```
    Bind the (plain javascript) model object to the dom node, with two-way binding
```js
var knockoff = require('knockoff')

var el = document.querySelector('#my-template-root')

model = {
    firstname: 'Karl'
}

knockoff(el, model)
```

## License

  MIT