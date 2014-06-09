var acorn = require('acorn')
var Binding = require('./binding')

module.exports = clickVisitor;

function clickVisitor (node, model) {
    if (!node.tagName) {
        return
    }

    var bindings = Binding.prototype.getBindingAttrs(node);
    var clickBindingDecl = bindings && bindings.filter(function (b) {
        return b.key == 'click'
    }).pop()

    if (clickBindingDecl) {
        return new ClickBinding(node, model, clickBindingDecl.value);
    }
}

ClickBinding.prototype = Object.create(Binding.prototype)

function ClickBinding (node, model, method) {
    var fn
    if (method.type == 'Literal') {
        method = acorn.parse(method.value).body[0].expression
        fn = function () {
            model.resolve(method);      
        }
    } else {
        fn = model.resolve(method)  
    }
    

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

    node.addEventListener('click', function (e) {
        fn.call(context, e)
    })
}
