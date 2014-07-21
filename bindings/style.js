var Binding = require('./binding')

module.exports = styleVisitor;

function styleVisitor (node, model) {
    if (!node.tagName) {
        return
    }

    var bindings = Binding.prototype.getBindingAttrs(node);
    var styleBindingDecl = bindings && bindings.filter(function (b) {
        return b.key == 'style'
    }).pop()

    if (styleBindingDecl) {
        new StyleBinding(node, model, styleBindingDecl.value);
    }
}

StyleBinding.prototype = Object.create(Binding.prototype)

function StyleBinding (node, model, expr) {
    var self = this
    setStyle(model, expr)
    this.onchange(model, expr, setStyle.bind(null, model, expr))

    function setStyle(model, expr) {
           var styleProperties = self.evaluate(model, expr)

           var style = Object.keys(styleProperties).reduce(function (acc, cur) {
                   return acc + cur + ':' + styleProperties[cur] + ';';
           }, '')
           node.setAttribute('style', style);
    }
}