var Binding = require('./binding')

module.exports = valueVisitor;

function valueVisitor (node, model) {
    if (!node.tagName) {
        return
    }

    var bindings = Binding.prototype.getBindingAttrs(node);
    var valueBindingDecl = bindings && bindings.filter(function (b) {
        return b.key == 'value'
    }).pop()

    if (valueBindingDecl) {
        // if (node.tagName.toLowerCase() == 'select') {
        //     for(var i = 0; i< node.children.length; i++) {
        //         var opt=node.children[i];
        //         valueVisitor(opt, opt.model || model)
        //         var bindings = Binding.prototype.getBindingAttrs(opt).filter(function (b) {
        //             return b.key !== 'value';
        //         });
        //         Binding.prototype.setBindingAttrs(opt, bindings);
        //     }
        // }

        new ValueBinding(node, model, valueBindingDecl.value);
    }
}

ValueBinding.prototype = Object.create(Binding.prototype)

function ValueBinding (node, model, expr) {
    var self = this
    var inputting;
    function setValue() {
        var result = self.evaluate(model, expr)
        if (inputting !== result) {
            console.log("Setting value of node", node)
            node.value = (result || '').toString()
        }
    }
    
    setValue()

    this.onchange(model, expr, setValue)

    var setter = self.getSetter(model, expr);

    node.addEventListener('input', function (e) {
        inputting = e.target.value
        setter(e.target.value)
        inputting = void 0
    })
}