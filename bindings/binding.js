var globals = require('implicit-globals')
var memberExpressionsByRoot = require('member-expressions-by-root')
var uuid = require('uuid')
var acorn = require('acorn')

var BindingAccessor = require('../binding-accessor')
var codegen = require('escodegen').generate
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
    var rootDeps = globals(expr)

    var memberExpressions = memberExpressionsByRoot.bind(null, expr)

    var deps = rootDeps.reduce(function (acc, cur) {
        acc.push(cur)
        acc.push.apply(acc, memberExpressions(cur).map(codegen))
        return acc
    }, [])

    var watched = []
    watchPath.bind(watched)

    subPaths(deps)
        .map(function (p) {
            watchPath(model, p, handler)
        })

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

function watchPath(model, path, handler) {
    var propName = path.split('.').pop()

    var prop = getPropertyPath(model, path)

    // If array-like object watch for changes
    if (typeof prop == 'object' && prop.length) {
        if (prop.on) prop.on('change', handler);
    }

    var parent = model.head
    var parentP = parentPath(path)
    if (parentP) {
        parent = getPropertyPath(model, parentP)
    } else {
        parent = model.host(propName)
    }

    if (parent && parent.on) parent.on('change ' + propName, handler);
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