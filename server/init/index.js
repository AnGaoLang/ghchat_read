const fs = require('fs');
const getSqlContentMap = require('./util/get-sql-content-map'); // 获取所有sql脚本内容
const { query } = require('../utils/db');


// 打印脚本执行日志
const eventLog = (err, sqlFile, index) => {
  if (err) {
    console.log(`[ERROR] sql脚本文件: ${sqlFile} 第${index + 1}条脚本 执行失败 o(╯□╰)o ！`);
  } else {
    console.log(`[SUCCESS] sql脚本文件: ${sqlFile} 第${index + 1}条脚本 执行成功 O(∩_∩)O !`);
  }
};

// 获取所有sql脚本内容
const sqlContentMap = getSqlContentMap(); // 一个对象。key是文件名，value是文件的二进制数据流。

// 执行建表sql脚本
const createAllTables = async () => {
  for (const key in sqlContentMap) {
    const sqlShell = sqlContentMap[key];
    const sqlShellList = sqlShell.split(';'); // 以;拆分sql文件内sql语句，可以考虑把注释过滤掉

    for (const [i, shell] of sqlShellList.entries()) {
      if (shell.trim() && shell.indexOf('*/') < 0 && shell.indexOf('#') < 0) { // 清除收尾的空格
        // console.log(shell)
        const result = await query(shell); // 执行sql文件内的每一条sql语句
        if (result.serverStatus * 1 === 2) {
          eventLog(null, key, i);
        } else {
          eventLog(true, key, i);
        }
      }
    }
  }
  console.log('sql脚本执行结束！');
  console.log('请按 ctrl + c 键退出！');
};

createAllTables();
