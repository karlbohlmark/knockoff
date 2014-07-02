var Binding = require('./binding')

module.exports = keypressVisitor;

function keypressVisitor (node, model) {
    if (!node.tagName) {
        return
    }

    var bindings = Binding.prototype.getBindingAttrs(node);
    var keypressBindingDecl = bindings && bindings.filter(function (b) {
        return b.key == 'keypress'
    }).pop()

    if (keypressBindingDecl) {
        new KeypressBinding(node, model, keypressBindingDecl.value);
    }
}

KeypressBinding.prototype = Object.create(Binding.prototype)

function KeypressBinding (node, model, method) {
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

    node.addEventListener('keypress', function (e) {
        fn.call(context, e)
    })
}