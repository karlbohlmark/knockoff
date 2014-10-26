var Binding = require('./binding')

module.exports = optionsVisitor;

function ValueBind (node, model, expr) {
    var self = this
    var inputting;
    function setValue() {
        var result = self.evaluate(model, expr)
        if (inputting !== result) {
            console.log("Setting value of node", node)
            node.value = (result || '').toString()
        }
    }
    
    //setValue()

    //this.onchange(model, expr, setValue)

    var setter = Binding.prototype.getSetter(model, expr);

    node.addEventListener('input', function (e) {
        inputting = e.target.value
        var opt = e.target.options[e.target.selectedIndex]
        var val = opt.dataItem;
        console.log("set", model, expr, val)
        setter(val)
        inputting = void 0
    })
}

function optionsVisitor (node, model, bind) {
    if (!node.tagName) {
        return
    }

    var bindings = Binding.prototype.getBindingAttrs(node);
    var optionsBindingDecl = bindings && bindings.filter(function (b) {
        return b.key == 'options'
    }).pop()

    if (optionsBindingDecl) {
        new OptionsBinding(node, model, optionsBindingDecl.value, bindings);
    }
}

OptionsBinding.prototype = Object.create(Binding.prototype)

function OptionsBinding (node, model, expr, bindings) {
    var self = this

    var itemName = 'o'
    if (expr.type == 'BinaryExpression') {
        itemName = expr.left.name;
        expr = expr.right
        var valBinding = bindings.filter(function (b) {
            return b.key == 'value';
        }).pop()
        var vbind = new ValueBind(node, model, valBinding.value)
        bindings = bindings.filter(function (b) {return b.key !== 'value'})
        //bindings.push({key: optionsValue, raw: expr})
    }
    var coll = model.resolve(expr)
    var enumerable = expr.name
    
    var option = document.createElement('option')
    var optionValueBinding = bindings.filter(function (b) { return b.key == "optionsValue"}).pop();
    var optionTextBinding = bindings.filter(function (b) { return b.key == "optionsText"}).pop();
    

    var valueExpression, textExpression;
    if (optionValueBinding){
        valueExpression = itemName + '.' + unquote(optionValueBinding.raw)
    } else {
        valueExpression = itemName + '.value || ' + itemName + '.id || ' + itemName;
    }
    if (optionTextBinding){
        textExpression = itemName + '.' + unquote(optionTextBinding.raw)
    } else {
        textExpression = itemName + '.text || ' + itemName + '.name || ' + itemName;
    }

    var textBinding = bindings.filter(function (b) { return b.key == "text"}).pop();
    if (textBinding) {
        textExpression =  textBinding.raw;
    }
    bindings = bindings.filter(function (b) {return b.key != 'text'})
    self.setBindingAttrs(node, bindings)

    option.setAttribute('data-bind', "value: " + valueExpression
        + ", text: " + textExpression + ", foreach: " + itemName + " in " + enumerable)
    node.appendChild(option)
    return;
    // bindings.forEach(function(b) {
    //     if (['value', 'optionsText', 'optionsValue'].indexOf(b.key) != -1) {
    //         b.skip = true;
    //     }
    // })
    
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
        bindings = bindings.filter(function (b) {return b.key != 'value'})
        self.setBindingAttrs(node, bindings)
    }

    setOptions()
}

function unquote(val) {
    // Yeah whatever
    return val.replace('"', '').replace("'", '');
}