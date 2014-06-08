var Binding = require('./binding')

module.exports = src

src.prototype = Object.create(Binding.prototype)

function src (node, model, expr) {
    var self = this
    function setSrc() {
        var result = self.evaluate(model, expr)
        node.src = (result || '').toString()
    }
    
    setSrc()

    self.onchange(model, expr, setSrc)
}