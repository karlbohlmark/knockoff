module.exports = translateX;

function translateX (node, model, expr) {
    console.log('apply translate-x binding', expr)

    function translate() {
        var result = evaluate(model, expr)
        if (result) {
            node.style.webkitTransform = 'translateX(' + result + 'px)'
        } else {
            node.style.webkitTransform = 'none'
        }
    }

    translate()

    onchange(model, expr, translate)
}