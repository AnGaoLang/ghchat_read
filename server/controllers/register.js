const md5 = require('md5');
const userModel = require('../models/userInfo');

module.exports = async (ctx, next) => {
  const { name, password } = ctx.request.body;
  let res = await userModel.findDataByName(name);
  if (res.length) { // 如果依据用户名查出数据，则用户名已存在
    // 返回信息
    ctx.response.body = {
      success: false,
      message: '用户名已存在'
    };
  } else {
    await userModel.insertData([name, md5(password)]).then((result) => {
      result ? (
        ctx.response.body = {
          success: true,
          message: '注册成功！'
        }
      ) : (
        ctx.response.body = {
          success: false,
          message: '注册失败，请重新注册！'
        }
      )
    });
  }
};
