var codegen = require('escodegen').generate;
var uuid = require('uuid');

var ScopeChain = require('../scope-chain')
var Binding = require('./binding')

module.exports = foreach

function foreach(node, model, bind) {
    if (!node.tagName) {
        return
    }
    var bindings = Binding.prototype.getBindingAttrs(node);

    bindings = bindings && bindings.filter(function (b) {
        return b.key == 'foreach'
    }).pop()

    if (bindings) {
        var foreachBinding = new ForeachBinding(node, model, bindings.value, bind)

        return foreachBinding.tail;
    }
}

ForeachBinding.prototype = Object.create(Binding.prototype);

function ForeachBinding (node, model, expr, bind) {
    console.log("NEW FOREACH BINDING", node)
    var self = this;
    var collection = codegen(expr.right)
    var itemname = expr.left.name

    var coll =  model.resolve(expr.right)

    var id = uuid()
    var comment = document.createComment('knockoff-foreach:' + codegen(expr))
    var parent = node.parentNode
    var clone = node.cloneNode(true)

    parent.insertBefore(comment, node)
    node.parentNode.removeChild(node)
    
    clone.setAttribute('data-cloned', 'true')
    var bindings = this.getBindingAttrs(clone)

    bindings = bindings.filter(function (b) {
        return b.key != 'foreach'
    })

    this.setBindingAttrs(clone, bindings)

    var tail;

    function append (n) {
        var refNode = tail || comment
        insertAfter(n, refNode)

        tail = n
    }

    var itemNodeMap = new Map()


    function addItem (item) {
        var n = clone.cloneNode(true)
        var scope = {}
        scope[itemname] = item
        append(n)
        n.scope = scope
        self.pushScope(n, scope)
        itemNodeMap.set(item, n)
        if (self.initialized) {
            var m = new ScopeChain(scope, model);
            console.log("BINDING FROM FOREACH")
            bind(n, m)
        }
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
    this.initialized = true
    this.tail = comment.nextSibling
}

function insertAfter (newNode, ref) {
    if (ref.nextSibling) {
        ref.parentNode.insertBefore(newNode, ref.nextSibling)
    } else {
        ref.parentNode.appendChild(newNode)
    }
}