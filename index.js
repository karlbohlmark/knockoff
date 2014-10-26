if (typeof Map == 'undefined') {
    require('es6-shim')
}

var toFn = require('to-function')

var ScopeChain = require('./scope-chain')
var BindingAccessor = require('./binding-accessor')
var _bindings = require('./bindings');

var Binding = require('./bindings/binding')

/* Export bind */
module.exports = function (node, modelOrPromise) {
    when(modelOrPromise, function (value) {
        bind(node, value);
    })
};

module.exports.setFormatter = function (name, formatter) {
    if (!formatter) {
        formatter = name;
        name = formatter.name;
    }
    ScopeChain.globals.formatters[name] = formatter;
}

function when (promiseOrValue, cb) {
    if (promiseOrValue.then) {
        promiseOrValue.then(cb)
    } else {
        cb(promiseOrValue)
    }
}

var skipNodes = [];

function skipNode (n) {
    skipNodes.push(n);
}

function shouldSkip(n) {
    return skipNodes.indexOf(n) !== -1;
}

var memoryleak = module.exports.memoryleak = new Map()

var scopes = module.exports.scopes = new Map()

function bind(node, model) {
    if (!(model instanceof ScopeChain)){
        model = new ScopeChain(model);
    }
    var opt = {
        skipSiblings: true
    }
    visitTree(node, model, _bindings.template, opt);
    visitTree(node, model, _bindings.options, opt);
    visitTree(node, model, _bindings.foreach, opt);
    visitTree(node, model, _bindings.data, opt);
    visitTree(node, model, _bindings.text, opt);
    visitTree(node, model, _bindings.html, opt);
    visitTree(node, model, _bindings.click, opt);
    visitTree(node, model, _bindings.src, opt);
    visitTree(node, model, _bindings.value, opt);
    visitTree(node, model, _bindings.href, opt);
    visitTree(node, model, _bindings.style, opt);
    visitTree(node, model, _bindings.class, opt);
    visitTree(node, model, _bindings.display, opt);
    visitTree(node, model, _bindings.attr, opt);
    visitTree(node, model, _bindings.change, opt);
    visitTree(node, model, _bindings.input, opt);
    visitTree(node, model, _bindings.keypress, opt);

}

function visitTree(node, model, visitor, opt) {
    opt = opt || {}
    //console.log("visit Tree", node)
    if (!node.visits) {
        node.visits = 1
    } else {
        node.visits = node.visits + 1;
    }

    model = node.model || model

    var replacedNode = visitor(node, model, bind);
    if (replacedNode) {
        return visitTree(replacedNode, model, visitor)
    }

    if (node.firstChild) {
        var child = node.firstChild;
        visitTree(child, model, visitor);
    }

    if (opt.skipSiblings) return;
    
    var nextSibling = node.nextSibling
    if (nextSibling) {
        visitTree(nextSibling, model, visitor)
    }
}

module.exports.ScopeChain = ScopeChain;

module.exports.cloneTemplateNode = function (name) {
    if (!(name in this.templates)) {
        throw new Error("Cannot find template " + name + " Templates used in a template binding should be registered with 'registerTemplate(name, str)'")
    }

    var tmpl = this.templates[name]
    if (typeof tmpl == 'string') {
        var div = document.createElement('div');
        div.innerHTML = tmpl;
        tmpl = div.firstChild;
    }

    return tmpl;
}

Binding.prototype.cloneTemplateNode = module.exports.cloneTemplateNode.bind(module.exports);

module.exports.registerTemplate = function (name, template) {
    this.templates = this.templates || {};
    this.templates[name] = template;
}

Binding.prototype.registerTemplate = module.exports.registerTemplate.bind(module.exports);


module.exports.pushScope = function (node, scope) {
    this.scopes.set(node, scope)
}

Binding.prototype.pushScope = module.exports.pushScope.bind(module.exports);

Object.keys(_bindings).forEach(function (b) {
    module.exports[b] = _bindings[b]
})

// var ex = "text: stuff.asdf(), value: val, other-binding: stuffs.count < 9"

// //console.log(parseBinding(ex))
