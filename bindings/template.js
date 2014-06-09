var codegen = require('escodegen').generate;

var Binding = require('./binding')

module.exports = templateVisitor;

function templateVisitor (node, model, bind) {
    if (!node.tagName) {
        return
    }

    var bindings = Binding.prototype.getBindingAttrs(node);
    var templateBindingDecl = bindings && bindings.filter(function (b) {
        return b.key == 'template'
    }).pop()

    if (templateBindingDecl) {
        new TemplateBinding(node, model, templateBindingDecl.value, bind);
    }
}

TemplateBinding.prototype = Object.create(Binding.prototype);

function TemplateBinding (node, model, template, bind) {
    var self = this;
    var bindings = this.getBindingAttrs(node)
    // var data = bindings.filter(function (b) {
    //     return b.key == 'data'
    // }).pop()


    // var m = model
    // if (data) {
    //     m = this.getPropertyPath(model, codegen(data.value))
    // }

    var self = this
    function applyTemplate () {
        var templateName = self.evaluate(model, template)    
        var el = self.cloneTemplateNode(templateName);
        node.innerHTML = '';
        node.appendChild(el)
        if (self.initialized) {
            bind(el, el.model);
        }
        //bind(el, m)
    }

    applyTemplate()

    self.onchange(model, template, applyTemplate)
    this.initialized = true
}