const jwt = require('jsonwebtoken');
const md5 = require('md5');
const secret = require('../config').secret;
const userModel = require('../models/userInfo');

// 用户名登录系统只涉及非github用户，也就是github用户只能走github授权来登录
module.exports = async (ctx, next) => {
  const { name = '', password = '' } = ctx.request.body;
  // 用户、密码为空可以直接在前端验证
  // if (name === '' || password === '') {
  //   ctx.response.body = {
  //     success: false,
  //     message: '用户名或密码不能为空'
  //   };
  //   return;
  // };
  
  const RowDataPacket = await userModel.findDataByName(name); // 通过sql查找数据库
  const res = JSON.parse(JSON.stringify(RowDataPacket));

  // 数据库中查找到相应的用户名
  if (res.length > 0) {
    //   验证成功后，服务端会签发一个 Token，再把这个 Token 发送给客户端
    if (md5(password) === res[0].password) { // MD5加密，数据库里存的也是经过加密后的密码

      // 取出字段
      const {
        id, name, sex, website, github, intro, company, avatar, location, socketId
      } = res[0];

      // 签发一个token
      const payload = { id };
      const token = jwt.sign(payload, secret, {
        expiresIn: Math.floor(Date.now() / 1000) + 24 * 60 * 60 * 7 // 一周
      });

      // 返回前端json字符串
      ctx.body = {
        success: true,
        message: '登录成功',
        userInfo: {
          name,
          user_id: id,
          sex,
          website,
          github,
          intro,
          company,
          avatar,
          location,
          socketId,
          token
        }
      };
    } else { // 密码不对。返回密码错误
      ctx.body = {
        success: false,
        message: '密码错误'
      };
    }
  } else { // 未在数据库中查找到数据，则用户名错误
    ctx.body = {
      success: false,
      message: '用户名错误'
    };
  }
};
