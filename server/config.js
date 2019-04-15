const secrets = require('../secret'); // 引入的新建的secret.js文件

this._isProduction = process.env.NODE_ENV === 'production';

// 先新建一个数据库再连接
const db = this._isProduction ? secrets.db : {
  host: '127.0.0.1', // 数据库IP
  port: 3306, // 数据库端口
  database: 'ghchat', // 数据库名称
  user: 'root', // 数据库用户名
  password: '123456', // 数据库密码
};

const baseApi = 'api/v1';

const secret = this._isProduction ? (secrets && secrets.secretValue) : 'chat-sec';

module.exports = {
  db,
  baseApi,
  secret
};
