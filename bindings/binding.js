var uuid = require('uuid')
var acorn = require('acorn')

var BindingAccessor = require('../binding-accessor')

var ScopeChain = require('../scope-chain')

module.exports = Binding;

function Binding () {

}

Binding.prototype.evaluate = function evaluate (model, expr) {
    /*
    var evalexpr = '(function(){with(model){var r=' + expr + ';if(typeof r=="function")r=' + expr + '();return r;}}())'
    var r
    try {
        r = eval(evalexpr)
    } catch (e) {
        console.error(e)
    }
    */
    r = model.resolve(expr)
    return r
}



/*
    Run handler when expr changes in the context of model
*/
Binding.prototype.onchange = function onchange (model, expr, handler) {
    watchExpression(model, expr, handler);
}


function watchExpression(obj, expr, cb) {
    //TODO: Handle computed member expressions
    switch(expr.type) {
        case "Literal":
            break;
        case "ExpressionStatement":
            watchExpression(obj, expr.expression, cb);
            break;
        case "BinaryExpression":
            watchExpression(obj, expr.left, cb);
            watchExpression(obj, expr.right, cb);
            break;
        case "CallExpression":
            watchExpression(obj, expr.callee, cb)
            expr.arguments.forEach(function(arg) {
                watchExpression(obj, arg, cb);
            })
            break;
        case "MemberExpression":
            watchExpression(obj, expr.object, cb)
            var obj = resolve(obj, expr.object)
            if (obj) {
                watchExpression(obj, expr.property, cb)
            } else {
                console.log("no", expr.object)
            }
            break;
        case "Identifier":
            var identifierName = expr.name;
            if (obj instanceof ScopeChain) {
                obj = obj.host(identifierName) || obj.head;
            }
            if (!obj) {
                console.log("Could not resolve", identifierName)
                return
            }
            if (obj.on) {
                console.log("attaching change handler", expr.name)
                obj.on("change " + expr.name, cb)
            }
    }
}

function resolve(obj, expr) {
    return obj.resolve(expr)
}

Binding.prototype.getSetter = function getSetter(model, expr) {
    return function (value) {
        model.set(expr, value)
    }
}

Binding.prototype.getBindingAttrs =  function getBindingAttrs (node) {
    var bindingAccessor = new BindingAccessor(node)
    return bindingAccessor.get();
}

Binding.prototype.setBindingAttrs =  function setBindingAttrs (node, attrs) {
    new BindingAccessor(node).set(attrs)
}

Binding.prototype.getPropertyPath = getPropertyPath

function getPropertyPath(model, propertyPath) {
    var expr = memberExpressionFromPropertyPath(propertyPath.split('.'));
    return model.resolve(expr)
}


function subPaths (paths) {
    var o = {}
    paths.forEach(function (p) {
        ensurePath(o, p)
    })

    return allPaths(o)
}

function allPaths(o) {
    var keys = Object.keys(o)
    
    return keys.concat(keys.reduce(function (acc, key) {
        acc.push.apply(acc, allPaths(o[key])
            .map(function (childPath) {
                return key + '.' + childPath
            }))
        return acc
    }, []))
}

function ensurePath(o, path) {
    var parts = path.split('.')
    for(var i=0; i<parts.length; i++) {
        var part = parts[i];
        if (typeof o[part] == 'undefined') {
            o[part] = {}
        }
        o = o[part];
    }
}

function parentPath (path) {
    var parts = path.split('.')
    parts.pop()
    return parts.join('.')
}

function memberExpressionFromPropertyPath (parts, object) {
    if (!object) {
        object = object || { type: "Identifier", name: parts.shift() }
    }

    if (parts.length  == 0) {
        return object;
    }

    object = {
        type: 'MemberExpression',
        computed: false,
        object: object,
        property: {
            type: 'Identifier',
            name: parts.shift()
        }
    }

    return memberExpressionFromPropertyPath(parts, object)
}