import Vue from 'vue'
import App from './App.vue'

import { transformFromAstSync } from '@babel/core'
import { parse } from '@babel/parser'
import env from '@babel/preset-env'
import traverse from '@babel/traverse'
import * as t from '@babel/types'
Vue.config.productionTip = false
window.t = t 
// const expression = 'console.log(1)' 
// console.log(t.ExpressionStatement)
// console.log(t.ExpressionStatement(expression))

const content = `
console.time('heihei')
const a = ()=>{
  return new Promise((resolve, reject) => {
    setTimeout(function(){
      console.log('heihei')
      resolve()
    }, 10)
  })
}
a().then(()=>{
  console.log('is ok')
}).then()
async function b(){
  await a()
}
function c(){
  a()
}
c(3)
console.timeEnd('heihei')
`
const insertQeoqu = {}
const consoleLog= t.expressionStatement(t.callExpression(t.memberExpression(t.Identifier('console'),t.Identifier('log')), [t.StringLiteral('is test')]))
let ast = parse(content, { sourceType: 'module' })
traverse(ast, {
// enter(path){

//     if(path.isCallExpression()){
//       if (path.node.callee.object && path.node.callee.object.name === 'console') return
//       console.log(path.node)
//       path.insertBefore(consoleLog)
// 		}
// 	},
CallExpression(path){
      if (path.node.callee.object && path.node.callee.object.name === 'console') return
      const name = path.node.callee.name || path.node.callee.object.name
      insertQeoqu[name] = () => { path.parentPath.insertBefore(consoleLog) }
     // insertQeoqu[''].push(()=>path.parentPath.insertBefore(consoleLog))
}
})
// let newAst = ast.program.body.forEach(body => {
//   if (body.type === 'ExpressionStatement') {
//     newAst.push()
//   }
// })
console.log(ast)
setTimeout(()=>{
  Object.keys(insertQeoqu).forEach(key => {
    insertQeoqu[key]()
  })
  let { code } = transformFromAstSync(ast, null, {}) //presets: [env] 
console.log(code)
}, 1000)



new Vue({
  render: h => h(App),
}).$mount('#app')
