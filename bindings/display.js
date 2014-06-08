var Binding = require('./binding')

module.exports = display;

display.prototype = Object.create(Binding.prototype)

function display (node, model, expr) {
    var self = this
    function setDisplay() {
        var result = self.evaluate(model, expr)
        if (result === true) {
            return node.style.display = ''
        }
        if (typeof result == 'string') {
            return node.style.display = result
        }

        node.style.display = 'none'
    }

    setDisplay()

    self.onchange(model, expr, setDisplay)
}
