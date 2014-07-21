var acorn = require('acorn')

module.exports = BindingAccessor
module.exports.parseBinding = parseBinding

function BindingAccessor (el) {
	this.el = el 
}

BindingAccessor.prototype.get = function () {
	var bindings = this.el.getAttribute('data-bind-parsed');
	if (bindings) {
		return JSON.parse(bindings);
	}
	var str = this.el.getAttribute('data-bind')
	return str && parseBinding(str)
}

BindingAccessor.prototype.set = function (val) {
	if (typeof val == 'object') {
		val = JSON.stringify(val)
		this.el.setAttribute('data-bind-parsed', val)
		return
	}
	return this.el.setAttribute('data-bind', val)
}


function parseBinding (str) {
	if (!str) return [];
	var bindingExpression = '({' + str + '})'
	var ast = acorn.parse(bindingExpression)
	var bindingNodes = ast.body[0].expression.properties
	return bindingNodes.map(function (b) {
		b.key = b.key.name || b.key.value;
		b.raw = bindingExpression.substring(b.value.start, b.value.end)
		return b;
	})
}

module.exports.test = function () {
	var e = "text: name + 3, click: doStuff"
	
	console.log(parseBinding(e))
}