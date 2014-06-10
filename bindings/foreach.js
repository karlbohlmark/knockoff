var codegen = require('escodegen').generate;
var uuid = require('uuid');

var ScopeChain = require('../scope-chain')
var Binding = require('./binding')
var parseBinding = require('../binding-accessor').parseBinding

module.exports = foreach

function foreach(node, model, bind) {
    if (node.nodeType !== 1 && node.nodeType !== 8) {
        return
    }

    if (node.nodeType == 8) {
        var commentText = node.textContent
        if (!commentText.startsWith("knockoff-foreach:")) {
            return
        }
        var foreachDecl = commentText.replace("knockoff-", "");
        console.log("FOREACH COMMENT", foreachDecl)

        var f = new RevivedForeachBinding(node, model, foreachDecl, bind);
        return f.nextNode
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
RevivedForeachBinding.prototype = Object.create(ForeachBinding.prototype)

function RevivedForeachBinding (comment, model, foreachDecl, bind) {
    var self = this
    this.bind = bind
    this.comment = comment
    var foreachExpr = parseBinding(foreachDecl).pop().value
    var coll = this.coll = model.resolve(foreachExpr.right)
    var itemName = this.itemName = foreachExpr.left.name;
    this.model = model

    var items = []
    var next, clone

    if (comment.nextSibling.nodeType == 8) {
        // There are no items.
        var templateComment = comment.nextSibling
        var tmpDiv = document.createElement('div')
        tmpDiv.innerHTML = templateComment.textContent
        this.clone = tmpDiv.firstElementChild;
    } else {
        var itemNodeMap = this.itemNodeMap = new Map()
        var n = comment
        coll.forEach(function (item, index) {
            n = n.nextSibling;
            if (index == 0) {
                self.clone = n.cloneNode(true)
            }
            var scope = {}
            scope[itemName] = item
            n.model = new ScopeChain(scope, this.model);
            itemNodeMap.set(item, n);
            self.tail = n;
        })

        // while((next = next.nextSibling) && next.nodeType == 1) {
        //     if (!clone) {
        //         clone = next.cloneNode(true);
        //     }
        //     items.push(next)
        // }
        if (n.nextSibling.nodeType == 8) {
            var text = n.nextSibling.textContent;
            if (text == '/knockoff-' + foreachDecl) {
                console.log("fine and dandy")
            } else {
                console.log('nope, problems')
            }
        } else {
            console.log("expected ending comment, found", next)
        }

        if (coll.on) {
            coll.on('replace', this.replaceItem.bind(this))

            coll.on('remove', this.removeItem.bind(this))

            coll.on('add', this.addItem.bind(this))

            coll.on('move', this.moveItem.bind(this))

            coll.on('reset', this.reset.bind(this))
        }
        this.nextNode = comment.nextSibling
    }
    this.initialized = true
}

function ForeachBinding (node, model, expr, bind) {
    console.log("NEW FOREACH BINDING", node)
    var self = this;
    var collection = codegen(expr.right)
    var itemName = expr.left.name

    var coll = this.coll = model.resolve(expr.right)

    var comment = this.comment = document.createComment('knockoff-foreach:' + codegen(expr))
    var parent = node.parentNode
    var clone = this.clone = node.cloneNode(true)

    parent.insertBefore(comment, node)
    node.parentNode.removeChild(node)
    
    clone.setAttribute('data-cloned', 'true')
    var bindings = this.getBindingAttrs(clone)

    bindings = bindings.filter(function (b) {
        return b.key != 'foreach'
    })

    this.setBindingAttrs(clone, bindings)

    var tail;

    var itemNodeMap = this.itemNodeMap = new Map()

    coll.forEach(this.addItem.bind(this))

    if (coll.on) {
        coll.on('replace', this.replaceItem.bind(this))

        coll.on('remove', this.removeItem.bind(this))

        coll.on('add', this.addItem.bind(this))

        coll.on('move', this.moveItem.bind(this))

        coll.on('reset', this.reset.bind(this))
    }
    this.initialized = true
    this.nextNode = comment.nextSibling
}

ForeachBinding.prototype.append = function (n) {
    var refNode = this.tail || this.comment
    insertAfter(n, refNode)

    this.tail = n
}

ForeachBinding.prototype.addItem = function addItem (item) {
    var n = this.clone.cloneNode(true)
    var scope = {}
    scope[this.itemName] = item
    this.append(n)
    n.model = new ScopeChain(scope, this.model);

    this.itemNodeMap.set(item, n)
    if (this.initialized) {
        var m = new ScopeChain(scope, this.model);
        console.log("BINDING FROM FOREACH")
        this.bind(n, m)
    }
}

ForeachBinding.prototype.removeItem = function removeItem (item) {
    var node = this.itemNodeMap.get(item)
    this.itemNodeMap.delete(item)
    if (node === tail) {
        tail = node.previousSibling
    }
    node.parentNode.removeChild(node)
}

ForeachBinding.prototype.moveItem = function moveItem (from, to, item) {
    var node = this.itemNodeMap.get(item)
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

ForeachBinding.prototype.reset = function reset (oldItems, newItems) {
    oldItems.forEach(this.removeItem.bind(this))
    this.coll.forEach(this.addItem.bind(this))
}

/*
    Added to handle editable collections of primitives.
    Currently limited to handling collections with unique items
*/
ForeachBinding.prototype.replaceItem = function (index, newVersion, oldVersion) {
    var node = this.itemNodeMap.get(oldVersion)
    this.itemNodeMap.delete(oldVersion)
    var m = {}
    m[this.itemName] = newVersion
    this.bind(node, m)
    this.itemNodeMap.set(newVersion, node)
}

function insertAfter (newNode, ref) {
    if (ref.nextSibling) {
        ref.parentNode.insertBefore(newNode, ref.nextSibling)
    } else {
        ref.parentNode.appendChild(newNode)
    }
}