var Binding = require('./binding')

module.exports = src

function src (node, model) {
    if (!node.tagName) {
        return
    }

    var bindings = Binding.prototype.getBindingAttrs(node);
    var srcBindingDecl = bindings && bindings.filter(function (b) {
        return b.key == 'src'
    }).pop()

    if (srcBindingDecl) {
        new SrcBinding(node, model, srcBindingDecl.value);
    }
}

SrcBinding.prototype = Object.create(Binding.prototype)

function SrcBinding (node, model, expr) {
    var self = this
    function setSrc() {
        var result = self.evaluate(model, expr)
        node.src = (result || '').toString()
    }
    
    setSrc()

    self.onchange(model, expr, setSrc)
}