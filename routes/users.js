// @ts-ignore
const router = require('koa-router')()
const utils = require('../utils')
const jwt = require('jsonwebtoken')
const MongoClient = require('mongodb').MongoClient;
router.prefix('/users')
const mongodb = new utils.dbtools('DEMO')
//登陆
router.post('/login',  async (ctx, next)  => {
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
  const user =  await mongodb.findData('userInfo');
  console.log(user)
  const usernameList = user.map(item => item.username);
  const passwordList = user.map(item => item.password);
  if (usernameList.includes(username)) {
    if (passwordList.includes(password)) {
      body = utils.formatData({ token }, true)
    } else {
      body = utils.formatData({}, false, '密码有误请重新输入')
    }
  } else {
    body = utils.formatData({}, false, '账号有误请重新输入')
  }
  ctx.body = body
})
//注册
router.post('/registered',  async (ctx, next) =>{
  try{
    const { username, password, secretSecurity } = ctx.request.body;
    const user =  await mongodb.findData('userInfo');
    const flag = user.some(item => item.username === username); //查重
    if (!flag) {
      try {
        const userInfo = await mongodb.inser('userInfo','insertOne',{ username, password});
        const querstion = await mongodb.inser('querstion','insertMany',secretSecurity.map(v => ({ ...v, username} )));
        const status =  userInfo.insertedCount && querstion.insertedCount;
        ctx.body = utils.formatData({},Boolean(status), status ? '注册成功' : '注册失败');
      } catch(err) {
        console.log("错误：" + err.message);
      }
    } else {
      ctx.body = utils.formatData({}, false, '账号名重复');
    }
  } catch(err) {
    ctx.body = err
  }
})
//找回密码--查询问题
router.post('/findQuestion',  async (ctx, next) =>{
  const { username } = ctx.request.body;
  const result =  await mongodb.findData('querstion',{ username });
  const querstion = result.map(item => item.querstion);
  if (result.length) {
    ctx.body = utils.formatData({ querstion }, true)
  } else {
    ctx.body = utils.formatData({}, false, '账号有误请重新输入')
  }
})
//找回密码--验证问题
router.post('/verification',  async (ctx, next) =>{
  const { username , secretSecurity } = ctx.request.body;
  const result =  await mongodb.findData('querstion',{ username });
  const querstion = JSON.stringify(result.map(v=> ({ querstion: v.querstion, answer: v.answer})));
  if (JSON.stringify(secretSecurity) === querstion) {
    ctx.body = utils.formatData({}, true, '验证成功')
  } else {
    ctx.body = utils.formatData({}, false, '验证失败')
  }
})
//找回密码--修改密码
router.post('/modifyPassword',  async (ctx, next) =>{
  const { username, password } = ctx.request.body;
  let result = await mongodb.upDate('userInfo', { username }, { password });
  if (result.result.nModified) {
    ctx.body = utils.formatData({}, true, '密码修改成功')
  } else {
    ctx.body = utils.formatData({}, true, '密码修改失败')
  }
})
module.exports = router