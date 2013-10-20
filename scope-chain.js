var staticEval = require('static-eval')

module.exports = ScopeChain

function ScopeChain(head, tail) {
	this.head = head
	this.tail = tail
}

ScopeChain.prototype.resolve = function (expr) {
	var val = staticEval(expr, this.head)
	return val !== void(0) ?
		val:
		this.tail.resolve(expr)
}