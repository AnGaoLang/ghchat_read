const fs = require('fs');
const walkFile = require('./walk-file'); // 获取目标目录下所有目标格式的文件(工具函数)

/**
 * 获取指定目录下的文件目录数据
 * @return {object}
 */
function getSqlMap() {
  // 获取当前文件所在目录的绝对路径
  let basePath = __dirname; // C:\Users\sy\Desktop\项目\personal\ghChat-master\server\init\util

  basePath = basePath.replace(/\\/g, '\/'); // '\'替换'/'

  let pathArr = basePath.split('\/'); // [ 'C:','Users','sy','Desktop','项目','personal','ghChat-master','server','init','util' ]

  pathArr = pathArr.splice(0, pathArr.length - 1); // 去掉最后的一个'util';

  basePath = `${pathArr.join('/')}/sql/`; // 将链接导向sql文件夹 C:/Users/sy/Desktop/项目/personal/ghChat-master/server/init/sql/

  const fileList = walkFile(basePath, 'sql'); // { 'ghchat.sql':'C:/Users/sy/Desktop/项目/personal/ghChat-master/server/init/sql/ghchat.sql' }
  return fileList;
}

module.exports = getSqlMap;
