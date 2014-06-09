var Binding = require('./binding')

module.exports = valueVisitor;

function valueVisitor (node, model) {
    if (!node.tagName) {
        return
    }

    var bindings = Binding.prototype.getBindingAttrs(node);
    var valueBindingDecl = bindings && bindings.filter(function (b) {
        return b.key == 'value'
    }).pop()

    if (valueBindingDecl) {
        new ValueBinding(node, model, valueBindingDecl.value);
    }
}

ValueBinding.prototype = Object.create(Binding.prototype)

function ValueBinding (node, model, expr) {
    var self = this
    function setValue() {
        var result = self.evaluate(model, expr)
        node.value = (result || '').toString()
    }
    
    setValue()

    this.onchange(model, expr, setValue)

    var setter = self.getSetter(model, expr);

    node.addEventListener('input', function (e) {
        setter(e.target.value)
    })
}