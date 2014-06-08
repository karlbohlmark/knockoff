var Binding = require('./binding')

module.exports = enable;

enable.prototype = Object.create(Binding.prototype)

function enable (node, model, expr) {
    var self = this
    this.onchange(model, expr, function () {
        var val = self.evaluate(model, expr);
        if (val) {
            node.removeAttribute('disabled')
        } else {
            node.setAttribute('disabled', 'disabled')
        }
    })
}
