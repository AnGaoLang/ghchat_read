import notification from '../../components/Notification';

export default class BrowserNotification {
  constructor() {
    this._notificationEnable = false; // 桌面消息提示框
    this._checkOrRequirePermission();
  }


  get permission() {
    return this.notification.permission; // 获取浏览器是否显示消息提示框的权限
  }

  set permission(value) {
    if (value) {
      this.notification.permission = value; // 设置权限
    }
  }

  get hasPermission() {
    return this.permission && (this.permission === 'granted'); // 获取当前权限的状态
  }

  get notification() {
    return window.Notification;
  }
  
   // 检查是都能打开nocifation
  _checkOrRequirePermission() {
    // console.log(this.notification)
    if (!this.notification) { // 判断浏览器是否支持notification
      // eslint-disable-next-line no-alert
      notification('此浏览器不支持浏览器提示', 'warn', 3); // 浏览器不支持notification的提示框
      return;
    }
    if (this.hasPermission) { // 是否有开启notification的权限
      this._notificationEnable = true; // 是否能打开_notificationEnabl
      return;
    }
    if (this.permission && this.permission !== 'denied') {
      // this.notification.requestPremission.then((status) => {
      //   if (this.permission !== status) {
      //     this.permission = status;
      //   }
      //   if (status === 'granted') {
      //     this._notificationEnable = true;
      //   }
      // });

      this.notification.requestPermission((status) => {
        if (this.permission !== status) {
          this.permission = status;
        }
        if (status === 'granted') {
          this._notificationEnable = true;
        }
      });
    }
  }

  // 
  notify({title, text, icon, onClick}) {
    if (!this._notificationEnable) { // 不支持notificatin直接返回
      return;
    }
    const n = new window.Notification(title, { body: text, icon });
    n.onclick = () => {
      onClick(); // 点击notification的回调
      n.close();
    };
  }
}
