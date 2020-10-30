// @ts-nocheck
require('./routes')
const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const registerRouter  = require('./routes')
const checkToken = require('./middleware/checkToken.js')
// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))
app.use(checkToken)
app.use(views(__dirname + '/views', {
  extension: 'pug'
}))
// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms - ${new Date().toLocaleString()}`)
})
app.use(registerRouter())
// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});
console.log('启动成功; 端口号3003')
app.listen(3003)
module.exports = app
