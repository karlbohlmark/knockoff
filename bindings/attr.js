var codegen = require('escodegen').generate;

var Binding = require('./binding')

module.exports = attr;

attr.prototype = Object.create(Binding.prototype)

function attr (node, model, bindings) {
    var self = this;
    bindings.properties.forEach(function (binding) {
        setAttrs(binding)
        self.onchange(model, codegen(binding.value), setAttrs.bind(null, binding))
    })

    function key (n) {
        switch (n.type) {
            case 'Identifier':
                return n.name;
            case 'Literal':
                return n.value;
        }
    }
    
    function setAttrs(b) {
        var result = self.evaluate(model, b.value)
        node.setAttribute( key(b.key), result)
    }   
}