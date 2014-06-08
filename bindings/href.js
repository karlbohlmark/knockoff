var Binding = require('./binding')

module.exports = href;

href.prototype = Object.create(Binding.prototype)

function href (node, model, expr) {
    var self = this
    function setHref() {
        var result = self.evaluate(model, expr)
        node.href = (result || '').toString()
    }
    
    setHref()

    self.onchange(model, expr, setHref)
}
