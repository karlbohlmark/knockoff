var Binding = require('./binding')

module.exports = displayVisitor;

function displayVisitor (node, model) {
    if (!node.tagName) {
        return
    }

    var bindings = Binding.prototype.getBindingAttrs(node);
    var displayBindingDecl = bindings && bindings.filter(function (b) {
        return b.key == 'display'
    }).pop()

    if (displayBindingDecl) {
        new DisplayBinding(node, model, displayBindingDecl.value);
    }
}

DisplayBinding.prototype = Object.create(Binding.prototype)

function DisplayBinding (node, model, expr) {
    var self = this
    function setDisplay() {
        var result = self.evaluate(model, expr)
        if (result === 'none' ||
            result === 'block' ||
            result === 'inline-block' ||
            result === 'box' ||
            result === 'table' ||
            result === 'table-row' ||
            result === 'table-cell'
            ) {
            return node.style.display = result
        } else if (result) {
            return node.style.display = ''
        }

        node.style.display = 'none'
    }

    setDisplay()

    self.onchange(model, expr, setDisplay)
}
