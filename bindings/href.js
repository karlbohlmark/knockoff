var Binding = require('./binding')

module.exports = hrefVisitor;

function hrefVisitor (node, model) {
    if (!node.tagName) {
        return
    }

    var bindings = Binding.prototype.getBindingAttrs(node);
    var hrefBindingDecl = bindings && bindings.filter(function (b) {
        return b.key == 'href'
    }).pop()

    if (hrefBindingDecl) {
        new HrefBinding(node, model, hrefBindingDecl.value);
    }
}

HrefBinding.prototype = Object.create(Binding.prototype)

function HrefBinding (node, model, expr) {
    var self = this
    function setHref() {
        var result = self.evaluate(model, expr)
        node.href = (result || '').toString()
    }
    
    setHref()

    self.onchange(model, expr, setHref)
}
