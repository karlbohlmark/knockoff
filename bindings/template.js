var codegen = require('escodegen').generate;

var Binding = require('./binding')

module.exports = template;

template.prototype = Object.create(Binding.prototype);

function template (node, model, template, bind, skip, bindings) {
    var data = bindings.filter(function (b) {
        return b.key == 'data'
    }).pop()


    var m = model
    if (data) {
        m = this.getPropertyPath(model, codegen(data.value))
    }

    var self = this
    function applyTemplate () {
        var templateName = self.evaluate(model, template)    
        var el = self.cloneTemplateNode(templateName);
        node.innerHTML = '';
        node.appendChild(el)
        bind(el, m) 
    }

    applyTemplate()

    self.onchange(model, template, applyTemplate)
}