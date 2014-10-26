var staticEval = require('static-eval')

module.exports = ScopeChain

ScopeChain.globals = {
	'Date': Date,
	'Array': Array,
	'Object': Object,
	'Number': Number,
	formatters: {}
}

function ScopeChain(head, tail) {
	this.head = head
	this.tail = tail
	if (typeof tail == 'undefined') {
		this.tail = new ScopeChain(ScopeChain.globals, false)
	}
}

ScopeChain.prototype.resolve = function (expr) {
	return staticEval(expr, this)
}

ScopeChain.prototype.set = function (expr, value) {
	var obj;
	var name
	if (expr.type == 'Identifier') {
		obj = this.host(expr.name)
		name = expr.name
	} else {
		obj = this.resolve(expr.object)
		name = expr.property.name
	}

	obj[name] = value
}

ScopeChain.prototype.host = function (name) {
	if (name in this.head) return this.head
	if (!this.tail) return void(0);
	return this.tail.host(name)
}

ScopeChain.prototype.has = function (name) {
	return (name in this.head) || this.tail && this.tail.has(name)
}

ScopeChain.prototype.lookup = function (name) {
	if (name in this.head) {
		return this.head[name]
	}
	if (!this.tail) return void(0)

	return this.tail.lookup(name)
}