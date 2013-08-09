if (typeof Map == 'undefined') {
	require('es6-shim')
}

var toFn = require('to-function')

var BindingAccessor = require('./binding-accessor')

var _bindings = require('./bindings');

module.exports = bind;

var skipNodes = [];

function skipNode (n) {
	skipNodes.push(n);
}

function shouldSkip(n) {
	return skipNodes.indexOf(n) !== -1;
}

function bind(node, model) {
	console.log('calling bind on', node)
	if (shouldSkip(node)) return;

	var bindingAccessor = new BindingAccessor(node)
	var bindings = bindingAccessor.get();
	
	var foreach = bindings.filter( function (b) { return b.key == 'foreach' } );
	
	if (foreach.length) bindings = foreach;

	var children = []
	for (var i = 0; i<node.children.length; i++) {
		children.push(node.children[i])
	}

	var skipChildren = bindings.reduce(function (skip, b) {
		return skip || _bindings[b.key](node, model, b.value, bind, skipNode);
	}, false)

	if (!skipChildren) {
		for (var i=0; i<children.length; i++) {
			var child = children[i];
			bind(child, model);
		}
	}
}

var ex = "text: stuff.asdf(), value: val, other-binding: stuffs.count < 9"

//console.log(parseBinding(ex))
