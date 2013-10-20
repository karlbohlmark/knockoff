var staticEval = require('static-eval')

module.exports = ScopeChain

function ScopeChain(head, tail) {
	this.head = head
	this.tail = tail
}

ScopeChain.prototype.resolve = function (expr) {
	var val = staticEval(expr, this)
	return val !== void(0) ?
		val:
		this.tail.resolve(expr)
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