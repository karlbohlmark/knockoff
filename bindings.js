var globals = require('implicit-globals')

module.exports.value = value
module.exports.text = text
module.exports.enable = enable
module.exports.click = click

function value (node, expr) {
	console.log('apply value binding')
}

function text (node, model, expr) {
	console.log('apply text binding', model, expr)
	

	function setText() {
		var result = evaluate(model, expr)
		node.textContent = result.toString()	
	}
	
	setText()

	onchange(model, expr, setText)
}

function evaluate (model, expr) {
	var evalexpr = '(function(){with(model){var r=' + expr + ';if(typeof r=="function")r=' + expr + '();return r;}}())'
	var r = eval(evalexpr)
	return r
}

/*
	Run handler when expr changes in the context of model
*/
function onchange (model, expr, handler) {
	var deps = globals(expr);
	deps.map(function (id) {
		var prop = model[id]
		if (prop.length) {
			prop.on('change', handler)
		}
		model.on('change ' + id, handler)
	})
}

function enable (node, model, expr) {
	onchange(model, expr, function () {
		var val = evaluate(model, expr);
		if (val) {
			node.removeAttribute('disabled')
		} else {
			node.setAttribute('disabled', 'disabled')
		}
	})
}

function click (node, model, method) {
	node.addEventListener('click', function (e) {
		model[method]()
	})
}