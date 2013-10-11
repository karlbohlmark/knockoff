var globals = require('implicit-globals')
var memberExpressionsByRoot = require('member-expressions-by-root')
var uuid = require('uuid')

var BindingAccessor = require('./binding-accessor')
var staticEval = require('static-eval')
var codegen = require('escodegen').generate

module.exports.value = value
module.exports.attr = attr
module.exports.text = text
module.exports.enable = enable
module.exports.click = click
module.exports.foreach = foreach
module.exports.options = options
module.exports.href = href
module.exports.src = src
module.exports.template = template
module.exports.data = data

function value (node, model, expr) {
	console.log('apply text binding', model, expr)
	

	function setValue() {
		var result = evaluate(model, expr)
		node.value = (result || '').toString()
	}
	
	setValue()

	onchange(model, expr, setValue)

	var setter = getSetter(model, expr);

	node.addEventListener('input', function (e) {
		setter(e.target.value)
	})
}

function getSetter(model, expr) {
	var propertyPath = codegen(expr);
	var parts = propertyPath.split('.')
	var last = parts.pop()
	var parentProp = parts.length > 1 ?
		getPropertyPath(model, parts.join('.')) : model
	return function (value) {
		parentProp[last] = value;
	}
}

function options (node, model, expr) {
	var coll = model

	function addOption (parent, value) {
		var opt = document.createElement('option')
		opt.value = value
		parent.appendChild(opt)
	}

	function clearOptions (list) {
		list.innerHTML = ''
	}

	function setOptions () {
		clearOptions(node)
		coll.forEach(addOption.bind(null, node))
	}

	model.on('change', setOptions)

	setOptions()
}


function text (node, model, expr) {
	console.log('apply text binding', model, expr)
	

	function setText() {
		var result = evaluate(model, expr)
		node.textContent = (result || '').toString()
	}
	
	setText()

	onchange(model, expr, setText)
}

function href (node, model, expr) {
	console.log('apply href binding', model, expr)
	

	function setHref() {
		var result = evaluate(model, expr)
		node.href = (result || '').toString()
	}
	
	setHref()

	onchange(model, expr, setHref)
}

function src (node, model, expr) {
	console.log('apply src binding', model, expr)
	

	function setSrc() {
		var result = evaluate(model, expr)
		node.src = (result || '').toString()
	}
	
	setSrc()

	onchange(model, expr, setSrc)
}

function attr (node, model, bindings) {
	console.log('apply attr binding', model, bindings)

	bindings.properties.forEach(function (binding) {
		setAttrs(binding)
		onchange(model, codegen(binding.value), setAttrs.bind(null, binding))
	})

	function key (n) {
		switch (n.type) {
			case 'Identifier':
				return n.name;
			case 'Literal':
				return n.value;
		}
	}
	
	function setAttrs(b) {
		var result = evaluate(model, b.value)
		node.setAttribute( key(b.key), result)
	}	
}

function evaluate (model, expr) {
	/*
	var evalexpr = '(function(){with(model){var r=' + expr + ';if(typeof r=="function")r=' + expr + '();return r;}}())'
	var r
	try {
		r = eval(evalexpr)
	} catch (e) {
		console.error(e)
	}
	*/
	r = staticEval(expr, model)
	return r
}

function subPaths (paths) {
	var o = {}
	paths.forEach(function (p) {
		ensurePath(o, p)
	})

	return allPaths(o)
}

function ensurePath(o, path) {
	var parts = path.split('.')
	for(var i=0; i<parts.length; i++) {
		var part = parts[i];
		if (typeof o[part] == 'undefined') {
			o[part] = {}
		}
		o = o[part];
	}
}

function allPaths(o) {
	var keys = Object.keys(o)
	
	return keys.concat(keys.reduce(function (acc, key) {
		acc.push.apply(acc, allPaths(o[key])
			.map(function (childPath) {
				return key + '.' + childPath
			}))
		return acc
	}, []))
}

/*
	Run handler when expr changes in the context of model
*/
function onchange (model, expr, handler) {
	var rootDeps = globals(expr)

	var memberExpressions = memberExpressionsByRoot.bind(null, expr)

	var deps = rootDeps.reduce(function (acc, cur) {
		acc.push(cur)
		acc.push.apply(acc, memberExpressions(cur).map(codegen))
		return acc
	}, [])

	var watched = []
	watchPath.bind(watched)

	subPaths(deps)
		.map(function (p) {
			watchPath(model, p, handler)
		})

}

function parentPath (path) {
	var parts = path.split('.')
	parts.pop()
	return parts.join('.')
}

function watchPath(model, path, handler) {
	var propName = path.split('.').pop()

	var prop = getPropertyPath(model, path)

	// If array-like object watch for changes
	if (typeof prop == 'object' && prop.length) {
		if (prop.on) prop.on('change', handler);
	}

	var parent = model
	var parentP = parentPath(path)
	if (parentP) {
		parent = getPropertyPath(model, parentP)
	}

	if (parent.on) parent.on('change ' + propName, handler);
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
	var fn = staticEval(method, model)

	var context = model;

	if (method.type == 'MemberExpression') {
		var property = method.property
		if (method.object.object) {
			while (method.object.object == 'MemberExpression') {
				method.object = method.object.property
				method.property = property
			}
		} else {
			method = method.object
		}
		context = staticEval(method, model)
	}

	node.addEventListener('click', function (e) {
		fn.call(context, e)
	})
}

function getMemberExpressionProp (memberExpression) {

}

function insertAfter (newNode, ref) {
	if (ref.nextSibling) {
		ref.parentNode.insertBefore(newNode, ref.nextSibling)
	} else {
		ref.parentNode.appendChild(newNode)
	}
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

function template (node, model, template, bind, skip, bindings) {
	var templateName = evaluate(model, template)
	var el = this.cloneTemplateNode(templateName);
	
	var data = bindings.filter(function (b) {
		return b.key = 'data'
	}).pop()

	if (data) {
		model = getPropertyPath(model, codegen(data.value))
	}

	node.innerHTML = '';
	node.appendChild(el)
	bind(el, model)
}

function data () {

}

function foreach (node, model, iteration, bind, skip) {
	skip(node)
	var collection = codegen(iteration.right)
	var itemname = iteration.left.name

	var coll = getPropertyPath(model, collection)

	var id = uuid()
	var comment = document.createComment('knockoff-foreach:' + id)
	var parent = node.parentNode
	var clone = node.cloneNode(true)

	parent.insertBefore(comment, node)
	node.parentNode.removeChild(node)
	
	var bindingAccessor = new BindingAccessor(clone)

	var bindings = bindingAccessor.get()

	bindings = bindings.filter(function (b) {
		return b.key != 'foreach'
	})

	bindingAccessor.set(bindings)

	var tail;

	function append (n) {
		var refNode = tail || comment
		insertAfter(n, refNode)

		tail = n
	}

	var itemNodeMap = new Map()

	function addItem (item) {
		var n = clone.cloneNode(true)
		var m = {}
		Object.keys(model).forEach(function (key) {
			m[key] = model[key]
		})
		m[itemname] = item
		append(n)
		bind(n, m)
		itemNodeMap.set(item, n)
	}

	/*
		Added to handle editable collections of primitives.
		Currently limited to handling collections with unique items
	*/
	function replaceItem (index, newVersion, oldVersion) {
		var node = itemNodeMap.get(oldVersion)
		itemNodeMap.delete(oldVersion)
		var m = {}
		m[itemname] = newVersion
		bind(node, m)
		itemNodeMap.set(newVersion, node)
	}

	function removeItem (item) {
		var node = itemNodeMap.get(item)
		itemNodeMap.delete(item)
		if (node === tail) {
			tail = node.previousSibling
		}
		node.parentNode.removeChild(node)
	}

	function reset (oldItems, newItems) {
		oldItems.forEach(removeItem)
		coll.forEach(addItem)
	}

	function moveItem (from, to, item) {
		var node = itemNodeMap.get(item)
		if (node === tail) {
			tail = node.previousSibling
		}
		var parent = node.parentNode
		var children = parent.children
		var ref = children[to]
		parent.removeChild(node)
		if (from > to) {
			ref = ref.previousSibling
		}
		insertAfter(node, ref)
	}

	coll.forEach(addItem)

	if (coll.on) {
		coll.on('replace', replaceItem)

		coll.on('remove', removeItem)

		coll.on('add', addItem)

		coll.on('move', moveItem)

		coll.on('reset', reset)
	}
	return true
}


function parseBinding() {

}