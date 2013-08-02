var globals = require('implicit-globals')
var uuid = require('uuid')
var parseBinding = require('./parse-binding')

module.exports.value = value
module.exports.text = text
module.exports.enable = enable
module.exports.click = click
module.exports.foreach = foreach

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
	var r
	try {
		r = eval(evalexpr)
	} catch (e) {
		console.error(e)
	}
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
			if (prop.on) prop.on('change', handler);
		}
		if (model.on) model.on('change ' + id, handler);
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

function insertAfter (newNode, ref) {
	if (ref.nextSibling) {
		ref.parentNode.insertBefore(newNode, ref.nextSibling)
	} else {
		ref.parentNode.appendChild(newNode)
	}
}

function serializeBindingAttr(bindings) {
	return bindings.map(function (b) {
		return b.key + ':' + b.expr
	}).join(', ')
}

function getPropertyPath(obj, propertyPath) {
	var parts = propertyPath.split('.')
	var val = obj
	for (var p = 0; p<parts.length; p++) {
		var prop = parts[p]
		val = val[prop]
	}
	return val
}

function foreach (node, model, iteration, bind, skip) {
	skip(node)
	var parts = iteration.split(' ')
	var collection = parts.pop()
	var itemname = parts.shift()

	var coll = getPropertyPath(model, collection)

	var id = uuid()
	var comment = document.createComment('knockoff-foreach:' + id)
	var parent = node.parentNode
	var clone = node.cloneNode(true)

	parent.insertBefore(comment, node)
	node.parentNode.removeChild(node)
	
	var bindings = parseBinding(clone.getAttribute('data-bind'))
	bindings = bindings.filter(function (b) {
		return b.key != 'foreach'
	})

	clone.setAttribute('data-bind', serializeBindingAttr(bindings))

	var tail;

	function append (n) {
		var refNode = tail || comment
		insertAfter(n, refNode)

		tail = n
	}

	function addItem (item) {
		var n = clone.cloneNode(true)
		var m = {}
		m[itemname] = item
		append(n)
		bind(n, m)
	}

	coll.forEach(addItem)

	coll.on('remove', function () {
		console.log('removed foreach item')
	})

	coll.on('add', function (item) {
		addItem(item)
	})
	return true
}