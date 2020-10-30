// @ts-ignore
const router = require('koa-router')()
const {
  user
} = require('../mocks/login')
const utils = require('../utils')
const jwt = require('jsonwebtoken')
router.prefix('/users')

router.post('/login', function (ctx, next) {
  let body;
  const { username, password } = ctx.request.body;
  const token = jwt.sign({
    //token的创建日期
    time: Date.now(),
    //token的过期时间
    timeout: Date.now() + 60 * 1000,
    username: username,
    // token：解析token的标识
  }, '3838438')
  const usernameList = user.map(user => user.username);
  const passwordList = user.map(user => user.password);
  if (usernameList.includes(username)) {
    if (passwordList.includes(password)) {
      body = utils.formatData({ token }, true)
    } else {
      body = utils.formatData({}, false, '密码有误请重新输入！')
    }
  } else {
    body = utils.formatData({}, false, '账号有误请重新输入！')
  }
  ctx.body = body
})
router.get('/detial', function (ctx, next) {
  console.log(ctx)
  ctx.body = 'this is a users/bar response'
})

module.exports = router