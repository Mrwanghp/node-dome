
const MongoClient = require('mongodb').MongoClient;
const formatData =  (data, state, message = '请求成功') => {
  return { data, state, message }
}
class dbtools{
    constructor(library) {
      this.url = 'mongodb://localhost:27017/'
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
    // 同步插入方法
    async inser(db,theWay, data) {
      return new Promise((resolve, reject)=> {
        db[theWay](data,(err,res)=>{
          if (err) reject (err);
          resolve()
        })
      })
    }
  }
module.exports = {
    formatData,
    dbtools,
}
