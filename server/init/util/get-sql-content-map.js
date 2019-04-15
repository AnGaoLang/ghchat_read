const fs = require('fs');
const getSqlMap = require('./get-sql-map'); // 获取sql文件对应的路径

const sqlContentMap = {};

/**
 * 读取sql文件内容
 * @param  {string} fileName 文件名称
 * @param  {string} path     文件所在的路径
 * @return {string}          脚本文件内容
 */
function getSqlContent(fileName, path) { //
  const content = fs.readFileSync(path, 'binary'); // 读取目标文件，返回二进制数据流。
  sqlContentMap[fileName] = content; // key是文件名，value是文件的二进制数据流。
}

/**
 * 封装所有sql文件脚本内容
 * @return {object}
 */
function getSqlContentMap() {
  const sqlMap = getSqlMap();
  for (const key in sqlMap) {
    getSqlContent(key, sqlMap[key]);
  }

  return sqlContentMap;
}

module.exports = getSqlContentMap;
