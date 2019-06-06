const qiniu = require('qiniu');
const secret = require('../../secret');

const { accessKey, secretKey, bucket, mainUrl } = secret.qiniu;

// 获取七牛的token
function getUploadToken() {
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

// 生成私有资源url方位的方法
function getPrivateUrl(key) {
  const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
  var config = new qiniu.conf.Config();
  var bucketManager = new qiniu.rs.BucketManager(mac, config);
  var deadline = parseInt(Date.now() / 1000) + 3600; // 1小时过期
  var privateDownloadUrl = bucketManager.privateDownloadUrl(mainUrl, key, deadline);
  return privateDownloadUrl;
}


module.exports = {
  getUploadToken: getUploadToken,
  getPrivateUrl: getPrivateUrl
};
