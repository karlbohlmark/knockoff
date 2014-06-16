var Binding = require('./binding')

module.exports = changeVisitor;

function changeVisitor (node, model) {
    if (!node.tagName) {
        return
    }

    var bindings = Binding.prototype.getBindingAttrs(node);
    var changeBindingDecl = bindings && bindings.filter(function (b) {
        return b.key == 'change'
    }).pop()

    if (changeBindingDecl) {
        new ChangeBinding(node, model, changeBindingDecl.value);
    }
}

ChangeBinding.prototype = Object.create(Binding.prototype)

function ChangeBinding (node, model, method) {
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

    node.addEventListener('change', function (e) {
        fn.call(context, e)
    })
}