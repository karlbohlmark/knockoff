var ScopeChain = require('../scope-chain')
var Binding = require('./binding')

module.exports = dataVisitor

function dataVisitor (node, model) {
    if (!node.tagName) {
        return
    }

    var bindings = Binding.prototype.getBindingAttrs(node);
    var dataBindingDecl = bindings && bindings.filter(function (b) {
        return b.key == 'data'
    }).pop()

    if (dataBindingDecl) {
        new DataBinding(node, model, dataBindingDecl.value);
    }
}

DataBinding.prototype = new Binding()

function DataBinding (node, model, expr) {
    var self = this;

    function setData() {
        var result = self.evaluate(model, expr)
        node.firstElementChild.model = new ScopeChain(result)
    }
    
    setData()

    this.onchange(model, expr, setData)
}