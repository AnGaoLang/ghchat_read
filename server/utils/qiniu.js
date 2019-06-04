const qiniu = require('qiniu');
const secret = require('../../secret');

// 获取七牛的token
function getUploadToken() {
  const { accessKey, secretKey, bucket } = secret.qiniu;
  // 定义鉴权对象
  const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
 // 可在此指定凭证的有效时间 
  const options = {
    scope: bucket,
    // expires: 7200
  };
  const putPolicy = new qiniu.rs.PutPolicy(options);
  // 生成七牛的上传凭证
  const uploadToken = putPolicy.uploadToken(mac);
  console.log('uploadToken', uploadToken);
  return uploadToken;
}


module.exports = getUploadToken;
