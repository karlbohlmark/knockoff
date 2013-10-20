if (typeof Map == 'undefined') {
	require('es6-shim')
}

var toFn = require('to-function')

var ScopeChain = require('./scope-chain')
var BindingAccessor = require('./binding-accessor')
var _bindings = require('./bindings');

/* Export bind */
module.exports = function (node, modelOrPromise) {
	when(modelOrPromise, function (value) {
		bind(node, new ScopeChain(value));
	})
};

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

function bind(node, model) {
	if (shouldSkip(node)) return;

	if (memoryleak.get())
	if (memoryleak.has(node)) {
		console.warn('this node is already bound!', node, model);
	}
	memoryleak.set(node, model);

	var bindingAccessor = new BindingAccessor(node)
	var bindings = bindingAccessor.get();
	
	var foreach = bindings.filter( function (b) { return b.key == 'foreach' } );
	
	if (foreach.length) bindings = foreach;

	var children = []
	for (var i = 0; i<node.children.length; i++) {
		children.push(node.children[i])
	}

	var skipChildren = bindings.reduce(function (skip, b) {
		if (b.skip) {
			return skip;
		}
		return skip || _bindings[b.key].call(module.exports, node, model, b.value, bind, skipNode, bindings);
	}, false)

	if (!skipChildren) {
		for (var i=0; i<children.length; i++) {
			var child = children[i];
			bind(child, model);
		}
	}
}

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

module.exports.registerTemplate = function (name, template) {
	this.templates = this.templates || {};
	this.templates[name] = template;
}

Object.keys(_bindings).forEach(function (b) {
	module.exports[b] = _bindings[b]
})

var ex = "text: stuff.asdf(), value: val, other-binding: stuffs.count < 9"

//console.log(parseBinding(ex))
