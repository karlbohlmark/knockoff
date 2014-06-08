var Binding = require('./binding')

module.exports = value;

value.prototype = Object.create(Binding.prototype)

function value (node, model, expr) {
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