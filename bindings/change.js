var Binding = require('./binding')

module.exports = change;

change.prototype = Object.create(Binding.prototype)

function change (node, model, method) {
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