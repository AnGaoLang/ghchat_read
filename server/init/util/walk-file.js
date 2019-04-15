const fs = require('fs');

/**
 * 遍历获取指定目录下的所有目标格式文件
 * @param  {string} pathResolve  需进行遍历的目录路径
 * @param  {string} mime         遍历文件的后缀名
 * @return {object}              返回遍历后的目录结果
 */
const walkFile = (pathResolve, mime) => {
  const files = fs.readdirSync(pathResolve); // 读取目录下的所有文件,返回的是一个目录下文件名组成的数组：['ghchat.sql']

  const fileList = {};
  for (const [i, item] of files.entries()) { // i: 0; item:'ghchat.sql'
    const itemArr = item.split('\.'); // [ 'ghchat', 'sql' ]
    
    const itemMime = (itemArr.length > 1) ? itemArr[itemArr.length - 1] : 'undefined'; // 获取文件的文件类型
    const keyName = `${item}`;
    if (mime === itemMime) { // 获取目标格式文件的路径地址
      fileList[item] = pathResolve + item;
    }
  }

  return fileList;  // { 'ghchat.sql':'C:/Users/sy/Desktop/项目/personal/ghChat-master/server/init/sql/ghchat.sql' }
};

module.exports = walkFile;
