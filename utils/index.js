
const MongoClient = require('mongodb').MongoClient;
const formatData =  (data, state, message = '请求成功') => {
  return { data, state, message }
}
class dbtools{
    constructor(library) {
      this.url = 'mongodb://localhost:27017/'
      this.library = library
    }
    //mogon实例
    godb(table) {
        return new Promise((resolve,reject) => {
            MongoClient.connect(this.url, { useNewUrlParser: true, useUnifiedTopology: true },  (err, db) =>  {
                if (err) reject (err);
                resolve( {result: db.db(this.library).collection(table), db })
            })
        })
    }
    // 同步插入方法
    async inser(table, theWay, data) {
      return new Promise(async (resolve, reject)=> {
        let { result , db } = await this.godb(table);
        result[theWay](data,(err,result)=>{
          if (err) reject (err);
          resolve(result);
          db.close();
        })
      })
    }
    // 同步查询
    findData(table, data = {}) {
      return new Promise(async (resolve, reject) => {
        let { result , db } = await this.godb(table);
            result.find(data).toArray((err, result) => {
              if (err) reject(err);
              resolve(result);
              db.close();
          });
      })
    }
    // 修改
    upDate(table, condition, value) {
      return new Promise(async (resolve, reject) => {
        console.log(condition,value)
        let { result , db } = await this.godb(table);
            result.updateMany(condition, {$set:  value },(err, result) => {
              if (err) reject(err);
              resolve(result);
              db.close();
          });
      })
    }
  }
module.exports = {
    formatData,
    dbtools,
}
