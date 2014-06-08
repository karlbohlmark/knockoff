var Binding = require('./binding')

module.exports = options;

options.prototype = Object.create(Binding.prototype)

function options (node, model, expr, bind, skip, bindings) {
    var self = this
    var coll = model.resolve(expr)
    
    bindings.forEach(function(b) {
        if (['value', 'optionsText', 'optionsValue'].indexOf(b.key) != -1) {
            b.skip = true;
        }
    })
    
    var optionsTextExpr = bindings.filter(function (b) {
        return b.key == 'optionsText'
    }).pop()

    var optionsValueExpr = bindings.filter(function (b) {
        return b.key == 'optionsValue'
    }).pop()

    var optionsText, optionsValue

    if (optionsTextExpr) {
        optionsText = model.resolve(optionsTextExpr.value)
    }

    if (optionsValueExpr) {
        optionsValue = model.resolve(optionsValueExpr.value)
    }

    function addOption (parent, value) {
        var opt = document.createElement('option')
        var text = value
        if (typeof value == 'object') {
            text = optionsText && value[optionsText]
                || value.text
                || value.name
                || value
            value = optionsValue &&  value[optionsValue] || value.value || text
        }
        
        opt.value = value
        opt.textContent = text

        parent.appendChild(opt)
    }

    function clearOptions (list) {
        list.innerHTML = ''
    }

    function setOptions () {
        clearOptions(node)
        coll.forEach(addOption.bind(null, node))
        if (valueBinding) {
            var hasValue = setValue()
            if (hasValue === false && node.options.length > 0) {
                node.value = node.options[0].value
                setter(node.value)
            }
        }
    }

    if (typeof coll.on == 'function') {
        coll.on('change', setOptions)
    }

    var valueBinding = bindings.filter(function(b) {
        return b.key == 'value';
    }).pop()

    function setValue () {
        var result = self.evaluate(model, valueBinding.value)
        if (typeof result == 'object') {
            if('value' in result) {
                result = result.value;
            }
        }
        if (typeof result != 'undefined') {
            node.value = (result || '').toString()
        } else {
            return false;
        }
    }

    var setter;
    if (valueBinding) {
        setter = self.getSetter(model, valueBinding.value);
        node.addEventListener('change', function (e) {
            setter(node.value)
        })
        self.onchange(model, valueBinding.value, setValue)
    }

    setOptions()
}