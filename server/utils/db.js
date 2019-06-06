const mysql = require('mysql');
const dbConfig = require('../config').db;

const pool = mysql.createPool({
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  host: dbConfig.host,
});


const query = (sql, values) => new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      resolve(err);
    } else {
      connection.query(sql, values, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // console.log(rows)
          resolve(rows); // 这里的rows是一个json，数组项为对象，该对象为当前行的字段和值的键值对
        }
        connection.release();
      });
    }
  });
});


module.exports = {
  query
};
