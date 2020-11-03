// @ts-ignore
const router = require('koa-router')()
const utils = require('../utils')
const jwt = require('jsonwebtoken')
const MongoClient = require('mongodb').MongoClient;
router.prefix('/users')
const mongodb = new utils.dbtools('DEMO')
const findDataTable = (table)  => {
  return new Promise(async (resolve, reject) => {
    let { result , db } = await mongodb.godb(table);
        result.find().toArray((err, result) => {
          if (err) reject(err);
          resolve(result);
          db.close();
      });
  })
}
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
  const user =  await findDataTable('userInfo');
  console.log(user)
  const usernameList = user.map(item => item.username);
  const passwordList = user.map(item => item.password);
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
//注册
router.post('/registered',  async (ctx, next) =>{
  const { username, password, secretSecurity } = ctx.request.body;
  try {
    // 插入账号密码
    {
      let { result } = await mongodb.godb('userInfo');
      await mongodb.inser(result,'insertOne',{username,password})
    }
    // 插入问题与答案
    {
      let { result, db } = await mongodb.godb('querstion');
      await mongodb.inser(result,'insertMany',secretSecurity.map(v => ({ ...v, username} )));
      db.close();
    }
    ctx.body = utils.formatData({}, true, '注册成功')
  } catch(e) {
    throw e
  }
})
//找回密码--查询问题
router.post('/findQuestion',  async (ctx, next) =>{
  const { username } = ctx.request.body;
  let { result, db } = await mongodb.godb('querstion');
  result.find({username}).toArray((err,res)=>{
    const querstion = res.map(item => item.querstion);
    if (res.length) {
      ctx.body = utils.formatData({ querstion }, true)
    } else {
      ctx.body = utils.formatData({}, false, '账号有误请重新输入！')
    }
    db.close();
  })
})
//找回密码--验证问题
router.post('/verification',  async (ctx, next) =>{
  const { username , secretSecurity } = ctx.request.body;
  let { result, db } = await mongodb.godb('querstion');
  result.find({username}).toArray(( err, res)=>{
   if (JSON.stringify(secretSecurity) === JSON.stringify(res.map(v=>{ v.querstion, v.answer}))) {
      ctx.body = utils.formatData({}, true, '验证成功')
   } else {
      ctx.body = utils.formatData({}, false, '验证失败')
   }
   db.close();
  })
})
//找回密码--修改密码
router.post('/modifyPassword',  async (ctx, next) =>{
  const { username, password } = ctx.request.body;
  let { result, db } = await mongodb.godb('querstion');
  result.updateOne({username},{$set: { password }}).toArray(( err, res)=>{
    ctx.body = utils.formatData({}, true, '密码修改成功')
    db.close();
  })
})
module.exports = router