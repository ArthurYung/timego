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

const content2 = `
function c(){
  var s = 6
  var j = 9
  if (true) {
    if (false) {
      return 1
    }
  }
  for(let i = 0; i< 10; i++) {

    j = i
  }

  function varsd() {
    if (false) {
      return 2
    }
    let a = 4
    while(a<5) {
      if (a > 0) {
        return 3
      }
    }
    return 4
  }
  varsd();
  return 3
}
`

const content = `
console.time('heihei')
const a = ()=>{
  return new Promise((resolve, reject) => {
    let __resolve = (resolve, id)=>{
      return resolve
    }
    setTimeout(function(){
      console.log('heihei')
      resolve()
    }, 10)
  })
}
a().then(()=>{
  console.log('is ok')
})
async function b(){
  await a()
}
(function (){

	var s = 1
	console.log(s)
    {
		console.log(s+1)
		return
	}
	console.log(s+2)
})()
function c(){

  if (true) {
    if (false) {
      return 1
    }

  }
  if (false) {
    return 2
  }
  return 3
}
c(3)
console.timeEnd('heihei')
`
const insertQeoqu = {}
const consoleLog= t.expressionStatement(t.callExpression(t.memberExpression(t.Identifier('console'),t.Identifier('log')), [t.StringLiteral('is test')]))
const consoleEnd= t.expressionStatement(t.callExpression(t.memberExpression(t.Identifier('console'),t.Identifier('log')), [t.StringLiteral('is end')]))
let ast = parse(content2, { sourceType: 'module' })
traverse(ast, {
enter(path){

    // if(path.isCallExpression()){
    //   if (path.node.callee.object && path.node.callee.object.name === 'console') return
    //   console.log(path.node)
    //   path.insertBefore(consoleLog)
    // }
    if (path.isFunction()) {
      console.log(path)
      path.node.body.body.unshift(consoleLog)
      // const returns = path.get('body').get('body')
      // console.log(returns)
      const bodys = path.get('body').get('body')
      function rere(body) {
        if (Array.isArray(body)) {
          body.forEach(rere)
          return
        }
        if (body.node.type==='ReturnStatement') {
          body.insertBefore(consoleEnd)
          return
        }
        if (body.node.consequent && body.node.consequent.type === 'BlockStatement' ) {
          let newBody = body.get('consequent').get('body')
          rere(newBody)
          return
        }
        if (body.node.type === 'ForStatement' || body.node.type === 'WhileStatement') {
          let newBody = body.get('body').get('body')
          rere(newBody)
        }
      }
      rere(bodys)
    }
  },
// CallExpression(path){
//      // if (path.node.callee.object && path.node.callee.object.name === 'console') return
//       console.log(path)
//       const name = path.node.callee.name || path.node.callee.object.name
//       insertQeoqu[name] = () => { path.parentPath.insertBefore(consoleLog) }
//      // insertQeoqu[''].push(()=>path.parentPath.insertBefore(consoleLog))
// }

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
