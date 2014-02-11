# Knockoff

  Reactive data binding component with syntax partially compatible with knockoutjs

## Installation

    $ component install karlbohlmark/knockoff

## Basic example

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

## Reactive example

  Given a template node:

```html
<div class="container">
    <ul>
        <li data-bind="foreach: user in users">
        <span data-bind="text: user.name"></span>
        </li>
    </ul>
</div>
```
  Bind the change event emitting model object to the dom node
```js
var knockoff = require('knockoff')
var ObservableCollection = require('observable-collection')
var users = ObservableCollection([{
    name: "Regina Spektor"
}])
var el = document.querySelector('.container')

knockoff(el, {
    users: users
})

users.push({
    name: 'Amanda Palmer'
}) // A `li` element is created to reflect the changes in the collection
```

## License

  MIT