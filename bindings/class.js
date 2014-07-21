var Binding = require('./binding')

module.exports = classVisitor;

function classVisitor (node, model) {
    if (!node.tagName) {
        return
    }

    var bindings = Binding.prototype.getBindingAttrs(node);
    var classBindingDecl = bindings && bindings.filter(function (b) {
        return b.key == 'class'
    }).pop()

    if (classBindingDecl) {
        new ClassBinding(node, model, classBindingDecl.value);
    }
}

ClassBinding.prototype = Object.create(Binding.prototype)

/*
   Binding for adding a 'flag' class to an element,
   ie 'active', 'chosen', 'on' etc.

   When the given expression (identifier or member expression) evaluates
   to true, the identifier name is added to the class list of the element.

   Example template:
   <div data-bind="class: active"></div>

   Model: { active: true }
   Output: <div data-bind="class: active" class="active"></div>

   Model: { active: false }
   Output: <div data-bind="class: active"></div>
 */
function ClassBinding (node, model, expr) {
       var className = expr.name;
       if (expr.type == 'MemberExpression') {
               className = expr.property.name
       }


       function setClass() {
               var result = this.evaluate(model, expr)
               if (typeof result === "string") {
                    className = result;
               }
               if (result) {
                    node.classList.add(className)
               } else {
                    node.classList.remove(className)
               }
       }

       setClass.call(this)

       this.onchange(model, expr, setClass.bind(this))
}

