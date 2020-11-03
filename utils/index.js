
const MongoClient = require('mongodb').MongoClient;
class dbtools{
    constructor(url,library) {
      this.url = url
      this.library = library
    }
    godb(table) {
        return new Promise((resolve,reject) => {
            MongoClient.connect(this.url, { useNewUrlParser: true, useUnifiedTopology: true },  (err, db) =>  {
                if (err) reject (err);
                resolve( {result: db.db(this.library).collection(table), db })
            })
        })
    }
  }
const formatData =  (data, state, message = '请求成功') => {
    return { data, state, message }
}
// 同步插入方法
const inser = async (result,theWay, data) => {
    return new Promise((resolve, reject)=> {
      result[theWay](data,(err,res)=>{
        if (err) reject (err);
        resolve()
      })
    })
  }
module.exports = {
    formatData,
    dbtools,
    inser
}
