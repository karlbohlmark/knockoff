var readExpr = require('./parse')

module.exports = parseBinding

function peek (str) {
	return str[str.length-1]
}

function readKey (str) {
	var i = 0, c
	while ((c = str[i]) && c != ':') {
		i++
	}

	return i
}

function readChar (chr) {
	return function (str) {
		if (peek(str) != chr) {
			//throw new Error(chr)
		}
		return 1
	}
}

function readComma (str) {
	return readChar(',')(str)
}


function parseBinding (binding) {
	var pos = 0
	var str = binding
	var bindings = []
	
	function advance (reader) {
		var i = reader(str)
		var val = str.slice(0, i)
		str = str.slice(i, str.length)
		return val
	}
	
	do {
		var key = advance(readKey).trim()
		advance(readChar(':'))
		var expr = advance(readExpr).trim()
		advance(readComma)
		bindings.push({
			key: key,
			expr: expr
		})
	} while (str.length)

	return bindings;
}