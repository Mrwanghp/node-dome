// @ts-ignore
const router = require('koa-router')()
// const {
//   user
// } = require('../mocks/login')
const utils = require('../utils')
const jwt = require('jsonwebtoken')
const MongoClient = require('mongodb').MongoClient;
const mongodb = new utils.dbtools('','DEMO')
router.prefix('/users')
const findDataTable =  (library,table)  => {
  return new Promise((resolve, reject) => {
    MongoClient.connect('', { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
      if (err) reject (err);
      var dbo = db.db(library);
      dbo.collection(table).find().toArray((err, result) => {
          if (err) reject(err);
          resolve(result)
          db.close();
      });
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
  const user =  await findDataTable('DEMO','userInfo');
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
  const { username, password,secretSecurity } = ctx.request.body;
  try {
    // 插入账号密码
    {
      let { result } = await mongodb.godb('userInfo');
      await utils.inser(result,'insertOne',{username,password})
    }
    // 插入问题与答案
    {
      let { result, db } = await mongodb.godb('querstion');
      await utils.inser(result,'insertMany',secretSecurity.map(v => ({ ...v, username} )));
      db.close();
    }
    ctx.body = utils.formatData({}, true, '注册成功')
  } catch(e) {
    throw e
  }
})
//找回密码
router.post('/retrievPassword',  async (ctx, next) =>{
  const { username } = ctx.request.body;
  let { result, db } = await mongodb.godb('querstion');
  result.find({username}).toArray((err,result)=>{
    console.log(result)
    db.close();
  })
})
module.exports = router