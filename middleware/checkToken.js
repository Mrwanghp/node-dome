// 单独的创建一个中间件，然后在app.js中注册使用
const jwt = require('jsonwebtoken');
const utils = require('../utils');
const noCheckLogin = ['/users/login','/users/registered','/users/retrievPassword'];
async function check(ctx, next) {
    let url = ctx.url.split('?')[0];
    if (noCheckLogin.includes(url)) {
        await next()
    } else {
        // 否则获取到token
        let token = ctx.request.headers["authorization"]
        if (token) {
            // 如果有token的话就开始解析
            const tokenItem = jwt.verify(token, '3438438')
            // 将token的创建的时间和过期时间结构出来
            // @ts-ignore
            const { time, timeout } = tokenItem
            // 拿到当前的时间
            let data = new Date().getTime();
            // 判断一下如果当前时间减去token创建时间小于或者等于token过期时间，说明还没有过期，否则过期
            if (data - time <= timeout) {
                // token没有过期
                await next()
            } else {
                ctx.body = utils.formatData({
                    status: 405
                }, false, 'token 已过期，请重新登陆')
            }
        } else {
            ctx.body = utils.formatData({
                status: 405
            }, false, '请登录!')
        }
    }
}
module.exports = check