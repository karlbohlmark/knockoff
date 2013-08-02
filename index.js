var toFn = require('to-function')

var data_bind = 'data-bind';

var parseBinding = require('./parse-binding');
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
	var bindingAttr = node.getAttribute(data_bind);
	var bindings = bindingAttr && parseBinding(bindingAttr) || [];
	
	var foreach = bindings.filter( function (b) { return b.key == 'foreach' } );
	
	if (foreach.length) bindings = foreach;

	var children = []
	for (var i = 0; i<node.children.length; i++) {
		children.push(node.children[i])
	}

	var skipChildren = bindings.reduce(function (skip, b) {
		return skip || _bindings[b.key](node, model, b.expr, bind, skipNode);
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
