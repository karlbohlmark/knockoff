var Binding = require('./binding')

module.exports = inputVisitor;

function inputVisitor (node, model) {
    if (!node.tagName) {
        return
    }

    var bindings = Binding.prototype.getBindingAttrs(node);
    var inputBindingDecl = bindings && bindings.filter(function (b) {
        return b.key == 'input'
    }).pop()

    if (inputBindingDecl) {
        new InputBinding(node, model, inputBindingDecl.value);
    }
}

InputBinding.prototype = Object.create(Binding.prototype)

function InputBinding (node, model, method) {
    var fn = model.resolve(method)

    var context = model.head;

    if (method.type == 'MemberExpression') {
        var property = method.property
        if (method.object.object) {
            while (method.object.object == 'MemberExpression') {
                method.object = method.object.property
                method.property = property
            }
        } else {
            method = method.object
        }
        context = model.resolve(method)
    }

    node.addEventListener('input', function (e) {
        fn.call(context, e)
    })
}