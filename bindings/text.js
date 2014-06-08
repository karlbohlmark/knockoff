var Binding = require('./binding')

module.exports = TextBinding

function TextBinding (node, model, expr) {
    var self = this;

    function setText() {
        var result = self.evaluate(model, expr)
        node.textContent = (result || '').toString()
    }
    
    setText()

    this.onchange(model, expr, setText)
}

TextBinding.prototype = new Binding()