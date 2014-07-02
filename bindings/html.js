var Binding = require('./binding')

module.exports = textVisitor

function textVisitor (node, model) {
    if (!node.tagName) {
        return
    }

    var bindings = Binding.prototype.getBindingAttrs(node);
    var textBindingDecl = bindings && bindings.filter(function (b) {
        return b.key == 'html'
    }).pop()

    if (textBindingDecl) {
        new TextBinding(node, model, textBindingDecl.value);
    }
}

textVisitor.visitTags = true

function TextBinding (node, model, expr) {
    var self = this;

    function setText() {
        var result = self.evaluate(model, expr)
        node.innerHTML = (result || '').toString()
    }
    
    setText()

    this.onchange(model, expr, setText)
}

TextBinding.prototype = new Binding()