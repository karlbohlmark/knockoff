module.exports = transform

function transform(node) {
    node = replace(node) || node

    switch(node.type) {
        case 'Program':
            node.body = node.body.map(transform)
            break;
        case 'ExpressionStatement':
            node.expression = transform(node.expression)
            break;
        case 'UnaryExpression':
            node.argument = transform(node.argument)
            break;
        case 'BinaryExpression':
            node.left = transform(node.left)
            node.right = transform(node.right)
            break;
    }
    return node;
}

function replace(node) {
    console.log("replace", node.type)
    if (node.type === 'BinaryExpression' && node.operator === '|') {
        var formatter = node.right.name;
        return {
            type: 'CallExpression',
            callee: {
                type: 'MemberExpression',
                object: {
                    type: "Identifier",
                    name: 'formatters'
                },
                computed: false,
                property: {
                    type: 'Identifier',
                    name: formatter
                }
            },
            arguments: [node.left]
        }
    }
}
