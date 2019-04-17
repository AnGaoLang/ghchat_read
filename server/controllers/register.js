const md5 = require('md5');
const userModel = require('../models/userInfo');

module.exports = async (ctx, next) => {
  
  const { name, password } = ctx.request.body;
  
  let res = await userModel.findDataByName(name).then((result) => {
    if (result.length) { // 如果依据用户名查出数据，则用户名已存在
      // 返回信息
      ctx.response.body = {
        success: false,
        message: '用户名已存在'
      };
    } else {
      return 0;
    }
  });
  if (!res) {
    await userModel.insertData([name, md5(password)]).then((result1) => {
      ctx.response.body = {
        success: true,
        message: '注册成功！'
      }
    });
  }
  
  // await let res = userModel.findDataByName(name).then((result) => {
  //   // console.log(result);
  //   if (result.length) { // 如果依据用户名查出数据，则用户名已存在
  //     // 返回信息
  //     ctx.response.body = {
  //       success: false,
  //       message: '用户名已存在'
  //     };
  //   } else {
  //     console.log(111)
  //     // 如果未查到，则将用户和密码（经过md5加密）写入数据库
  //     userModel.insertData([name, md5(password)]).then((result1) => {
  //       console.log(result1);
  //       ctx.response.body = {
  //         success: true,
  //         message: '注册成功！'
  //       }
  //       console.log(222)
  //     });
  //   }

  // });
};
