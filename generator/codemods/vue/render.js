module.exports = (context) => {
  const {
    j,
    root
  } = context
  const origin = root.find(j.ObjectExpression)
    .filter(p => p.parentPath.node.type == 'ExportDefaultDeclaration')
    .at(0).get().value.properties

  const render = origin.filter(e => e.key.name == 'render')
  if (!render.length) {
    return
  }
  const params = render[0].params[0].name
  render[0].params = []
  const impRe = j(`import { h, resolveComponent } from 'vue'`).find(j.ImportDeclaration).get().value
  root.get().value.program.body.unshift(impRe)

  let args = new Set()
  j(render).find(j.CallExpression).map(e => {
    const fnNd = e.get().value
    if (fnNd.arguments.length) {
      args.add(fnNd.arguments[0].value)
      fnNd.arguments[0] =  j.identifier(fnNd.arguments[0].value)
    }
    if (fnNd.callee.name == params) {
      fnNd.callee.name = 'h'
    }
    return e
  })

  args.forEach(e => {
    const resolveNd = j(`const ${e} = resolveComponent('${e}') \n`).get().value.program.body[0]
    render[0].body.body.unshift(resolveNd)
  })
}