var Binding = require('./binding')

module.exports = checkedVisitor;

function checkedVisitor (node, model) {
    if (!node.tagName) {
        return
    }

    var bindings = Binding.prototype.getBindingAttrs(node);
    var checkedBindingDecl = bindings && bindings.filter(function (b) {
        return b.key == 'checked'
    }).pop()

    if (checkedBindingDecl) {
        new CheckedBinding(node, model, checkedBindingDecl.value);
    }
}

CheckedBinding.prototype = Object.create(Binding.prototype)

function CheckedBinding (node, model, expr) {
    var self = this
    var inputting;
    function setChecked() {
        var result = self.evaluate(model, expr)
        if (inputting !== result) {
            console.log("Setting checked property of node", node)
            node.checked = result || false
        }
    }
    
    setChecked()

    this.onchange(model, expr, setChecked)

    var setter = self.getSetter(model, expr);

    node.addEventListener('change', function (e) {
        inputting = e.target.checked
        setter(e.target.checked)
        inputting = void 0
    })
}