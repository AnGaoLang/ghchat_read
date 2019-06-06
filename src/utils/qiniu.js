import * as qiniu from 'qiniu-js';
// 七牛图片上传
export default async function upload(file, completeEvent) {
  // 获取七牛的token
  window.socket.emit('getQiniuToken', (data) => {
    const uploadToken = data;
    // observer 用来设置上传过程的监听函数，有三个属性 next、error、complete:
    const observer = {
      // 接收上传进度信息
      next(res) {
        // console.log('上传的进度消息')
        // console.log(res)

        // res.total.loaded: number，已上传大小，单位为字节。
        // res.total.total: number，本次上传的总量控制信息，单位为字节，注意这里的 total 跟文件大小并不一致。
        // res.total.percent: number，当前上传进度，范围：0～100。
        // console.log('qiniu observer next', res);
      },
      // 上传错误后触发
      // 当不是 xhr 请求错误时，会把当前错误产生原因直接抛出，诸如 JSON 解析异常等
      // 当产生 xhr 请求错误时，参数 err 包含 code、message、isRequestError 三个属性
      error(err) {
        // console.log('错误')
        // console.log(err)

        // err.isRequestError: 用于区分是否 xhr 请求错误；当 xhr 请求出现错误并且后端通过 HTTP 状态码返回了错误信息时，该参数为 true；否则为 undefined 。
        // err.reqId: string，xhr请求错误的 X-Reqid。
        // err.code: number，请求错误状态码，只有在 err.isRequestError 为 true 的时候才有效，可查阅码值对应说明。
        // err.message: string，错误信息，包含错误码，当后端返回提示信息时也会有相应的错误信息。
        // console.log('qiniu observer err', err);
        return err;
      },
      //接收上传完成后的后端返回信息
      complete(res) {
        // console.log('上传成功')
        // console.log(res)
        
        // res 参数为一个 object， 为上传成功后返回的信息
        // res.hash返回的图图片hash值
        // res.key上传到云对象存储后文件的名称。如下：外链域名+res.key 便是图片的网络绝对地址

        window.socket.emit('getQiniuPrivateUrl', res.key, function (res) {
          console.log(res)
          const fileUrl = res;
          completeEvent(fileUrl);
        })
        // const fileUrl = `http://psnxqoglh.bkt.clouddn.com/${res.key}?&token=${uploadToken}`;
        // 返回图片上传的cdn地址
        
      }
    };

    const config = { useCdnDomain: true }; // 是否使用cdn加速域名
    const putExtra = {};
    const { user_id } = JSON.parse(localStorage.getItem('userInfo'));
    const key = `${user_id}_${new Date().getTime()}_${file.name}`;
    // file:blob对象，上传的文件，key:文件资源名，uploadToken: 上传到七牛的token，
    // putExtra:{fname:文件原文件名,params:用来放置自定义变量,mimeType:限制上传文件类型}，config: 上传配置项
    const observable = qiniu.upload(file, key, uploadToken, putExtra, config); // 返回一个observable控制上传行为
     // 上传开始。observable 对像通过 subscribe 方法可以被 observer 所订阅，订阅同时会开始触发上传
     // 返回一个 subscription 对象，该对象有一个 unsubscribe 方法取消订阅，同时终止上传行为
    const subscription = observable.subscribe(observer);
  });
  // subscription.unsubscribe(); // 上传取消
}
