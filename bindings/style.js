var codegen = require('escodegen').generate;

var Binding = require('./binding')

module.exports = style;

style.prototype = Object.create(Binding.prototype)

function style (node, model, expr) {
    var self = this
    var val = codegen(expr)
    setStyle(model, expr)
    this.onchange(model, val, setStyle.bind(null, model, expr))

    function setStyle(model, expr) {
           var styleProperties = self.evaluate(model, expr)

           var style = Object.keys(styleProperties).reduce(function (acc, cur) {
                   return acc + cur + ':' + styleProperties[cur] + ';';
           }, '')
           node.setAttribute('style', style);
    }
}