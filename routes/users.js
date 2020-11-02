// @ts-ignore
const router = require('koa-router')()
// const {
//   user
// } = require('../mocks/login')
const utils = require('../utils')
const jwt = require('jsonwebtoken')
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://47.100.200.134:27017/";
router.prefix('/users')
const findDataTable =  (library,table)  => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
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
// const insertDataTable =  (library, table, data)  => {
//   return new Promise((resolve, reject) => {
//     MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
//       if (err) reject (err);
//       var dbo = db.db(library);
//       dbo.collection(table).insertMany(data,(err, result) => {
//           if (err) reject(err);
//           resolve(result)
//           db.close();
//       });
//     });
//   })
// }
class dbtools{
  constructor(url,library) {
    this.url = url
    this.library = library
  }
   godb(cb) {
      MongoClient.connect(this.url, { useNewUrlParser: true, useUnifiedTopology: true }, async (err, db) =>  {
        if (err) throw (err);
        await cb(db.db(this.library).collection('userInfo'))
        db.close();
      })
  }
  insertMany() {

  }
}
let db = new dbtools('mongodb://47.100.200.134:27017/','DEMO')
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
  db.godb((e)=>{
        e.find().toArray((err, result) => {
          if (err) throw (err);
          console.log(result)
      })
  })
  // let dbs = await db.godb()
//   console.log(dbs)
//   e.collection('userInfo').find().toArray((err, result) => {
//     if (err) throw (err);
//     console.log(result)
//     // db.db.close();
// });
  // console.log(username, password,secretSecurity)
  // insertDataTable('DEMO','userInfo')
})
module.exports = router