// @ts-ignore
const router = require('koa-router')()
// const {
//   user
// } = require('../mocks/login')
const utils = require('../utils')
const jwt = require('jsonwebtoken')
const MongoClient = require('mongodb').MongoClient;
const mongodb = new utils.dbtools('mongodb://47.100.200.134:27017/','DEMO')
router.prefix('/users')
const findDataTable =  (library,table)  => {
  return new Promise((resolve, reject) => {
    MongoClient.connect('mongodb://47.100.200.134:27017/', { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
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
// 同步插入方法
const inser = async (result,theWay, data) => {
  return new Promise((resolve, reject)=> {
    result[theWay](data,(err,res)=>{
      if (err) reject (err);
      console.log(11)
      resolve()
    })
  })
}
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
router.post('/registered',  async (ctx, next) =>{
  const { username, password,secretSecurity } = ctx.request.body;
  try {
    // 插入账号密码
    {
      let { result } = await mongodb.godb('userInfo');
      await inser(result,'insertOne',{username,password})
    }
    // 插入问题与答案
    {
      let { result, db } = await mongodb.godb('querstion');
      await inser(result,'insertMany',secretSecurity);
      db.close();
    }
    ctx.body = utils.formatData({}, true, '注册成功')
  } catch(e) {
    throw e
  }
})
module.exports = router