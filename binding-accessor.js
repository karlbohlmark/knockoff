var acorn = require('acorn')
var escodegen = require('escodegen')

module.exports = BindingAccessor

function BindingAccessor (el) {
	this.el = el 
}

BindingAccessor.prototype.get = function () {
	var str = this.el.getAttribute('data-bind')
	return parseBinding(str)
}

BindingAccessor.prototype.set = function (val) {
	if (typeof val == 'object') {
		val = serializeBindingAttr(val)
	}
	return this.el.setAttribute('data-bind', val)
}


function parseBinding (str) {
	if (!str) return [];
	var bindingExpression = '({' + str + '})'
	var ast = acorn.parse(bindingExpression)
	var bindingNodes = ast.body[0].expression.properties
	return bindingNodes.map(function (b) {
		b.key = b.key.name;
		b.raw = bindingExpression.substring(b.value.start, b.value.end)
		return b;
	})
}

function serializeBindingAttr(bindings) {
	return bindings.map(function (b) {
		return b.key + ':' + escodegen.generate(b.value)
	}).join(', ')
}


module.exports.test = function () {
	var e = "text: name + 3, click: doStuff"
	
	console.log(parseBinding(e))
}