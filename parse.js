module.exports = readExpr

function readExpr(str) {
	var i = 0, c, t, state
	var stack = [states.expr]
	while ((state = stack[stack.length-1]) && i < str.length) {
		c = str[i]
		if (c in state) {
			t = state[c]
			if (t == 'pop') {
				stack.pop()
			} else {
				stack.push(states[t])
			}
		}
		i++
	}

	return state ? i: i-1
}

var states = {
	expr: {
		'(': 'parenthesized',
		'[': 'squareBracketed',
		"'": 'singleQuoteString',
		'"': 'doubleQuoteString',
		',': 'pop'
	},
	parenthesized: {
		')': 'pop',
		'"': 'doubleQuoteString',
		"'": 'singleQuoteString',
	},
	squareBracketed: {
		']': 'pop',
		'"': 'doubleQuoteString',
		"'": 'singleQuoteString',
	},
	singleQuoteString: {
		"'": 'pop'
	},
	doubleQuoteString: {
		'"': 'pop'
	}
}

