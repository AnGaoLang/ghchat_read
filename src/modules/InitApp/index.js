import io from 'socket.io-client';
import store from '../../redux/store';
import {
  updateHomePageListAction,
  relatedCurrentChatAction,
  setHomePageListAction,
} from '../../containers/HomePageList/homePageListAction';
import {
  addGroupMessagesAction,
  addGroupMessageAndInfoAction,
  setAllGroupChatsAction,
} from '../../containers/GroupChatPage/groupChatAction';
import {
  addPrivateChatMessagesAction,
  addPrivateChatMessageAndInfoAction,
  setAllPrivateChatsAction,
} from '../../containers/PrivateChatPage/privateChatAction';
import notification from '../../components/Notification';
import BrowserNotification from '../BrowserNotification';
import Chat from '../Chat';
import Socket from '../../utils/socket';

class InitApp {
  constructor(props) {
    this.WEBSITE_ADDRESS = process.env.NODE_ENV === 'production' ? 'https://im.aermin.top' : 'http://localhost:3000';
    this._userInfo = JSON.parse(localStorage.getItem('userInfo')); // 用户信息
    this._hasCalledMe = false;
    this._history = props.history; // 页面路由信息
    this._browserNotification = new BrowserNotification();
    this._chat = new Chat();
    this._socket = new Socket();
  }

  // 桌面级消息提示框
  _browserNotificationHandle = (data) => {
    const { homePageListState } = store.getState(); // 获取全局的 homePageList 
    const { name, message, avatar } = data; // 姓名、消息、头像
    const chatType = data.to_group_id ? 'group_chat' : 'private_chat'; // 群组聊天还是私有聊天
    const chatFromId = data.to_group_id ? data.to_group_id : data.from_user; // chatid
    const title = data.to_group_id && data.groupName ? data.groupName : name; // 群名或用户名
    // 桌面级消息提示框
    this._browserNotification.notify({
      title,
      text: message,
      icon: avatar,
      onClick: () => { // 点击事件
        this._history.push(`/${chatType}/${chatFromId}?name=${title}`); // 跳到相应聊天框
        window.focus(); // 窗口聚焦
        this._chat.clearUnreadHandle({ homePageList: homePageListState, chatFromId }); // 清空消息未读数
      }
    });
  }

  // 监听私聊
  _listeningPrivateChatMsg = () => {
    window.socket.on('getPrivateMsg', (data) => {
      const { homePageListState, allPrivateChatsState } = store.getState(); // 全局 homePageList 、 allPrivateChats
      const { user_id } = this._userInfo; // 当前用户id
      // eslint-disable-next-line radix
      const chatId = parseInt(window.location.pathname.split('/').slice(-1)[0]); // 获取当前聊天的chatid
      const isRelatedCurrentChat = (data.from_user === chatId || data.to_user === chatId); // 判断新消息是否来源于当前私聊
      const increaseUnread = isRelatedCurrentChat ? 0 : 1; // 未读消息增加0或1
      store.dispatch(relatedCurrentChatAction(isRelatedCurrentChat)); // 分发更新全局isRelatedCurrentChat
      if (!allPrivateChatsState.get(data.from_user) || !allPrivateChatsState.get(data.from_user).userInfo) { // 如果当前用户不存在相应私聊
        // 构建用户信息
        const userInfo = {
          ...data,
          user_id: data.from_user
        };
        // 分发更新私聊信息和聊天消息
        store.dispatch(addPrivateChatMessageAndInfoAction({
          allPrivateChats: allPrivateChatsState, message: data, chatId: data.from_user, userInfo,
        }));
      } else { // 已存在相应私聊
        // 更新私聊消息
        store.dispatch(addPrivateChatMessagesAction({
          allPrivateChats: allPrivateChatsState,
          message: data,
          chatId: data.from_user,
        }));
      }
      // 分发更新 homePageList 及未读消息树
      store.dispatch(updateHomePageListAction({
        data, homePageList: homePageListState, myUserId: user_id, increaseUnread
      }));
      // 弹出桌面级消息提示框
      this._browserNotificationHandle(data);
      // TODO: mute notifications switch
    });
  }

  // 监听群组消息
  _listeningGroupChatMsg = () => {
    window.socket.on('getGroupMsg', (data) => {
      const { allGroupChatsState, homePageListState } = store.getState(); // 获取全局 allGroupChats、homePageList
      // eslint-disable-next-line radix
      const chatId = window.location.pathname.split('/').slice(-1)[0]; // 获取当前聊天的chatid
      const isRelatedCurrentChat = (data.to_group_id === chatId); // 判断新消息是否来源于当前群组
      store.dispatch(relatedCurrentChatAction(isRelatedCurrentChat)); // 分发全局 relatedCurrentChat
      if (data.tip === 'joinGroup') { // 加入群组
        // 分发更新 群组信息、群聊天消息 的action
        store.dispatch(addGroupMessageAndInfoAction({
          allGroupChats: allGroupChatsState,
          groupId: data.to_group_id,
          message: data,
          member: data,
        }));
      } else { // 已加入群组
        // 更新群聊消息
        store.dispatch(addGroupMessagesAction({ allGroupChats: allGroupChatsState, message: data, groupId: data.to_group_id }));
      }
      // 消息存在，@我的状态为false
      if (data.message && !this._hasCalledMe) {
        const regexp = new RegExp(`@${this._userInfo.name}\\s\\S*|@${this._userInfo.name}$`); // @我的正则
        this._hasCalledMe = regexp.test(data.message); // 依据消息是否匹配 @我的正则 更新 _hasCalledMe 的状态
      }
      // 更新全局 HomePageList，包括 未读消息、@我的提示
      store.dispatch(updateHomePageListAction({
        data,
        homePageList: homePageListState,
        increaseUnread: isRelatedCurrentChat ? 0 : 1,
        showCallMeTip: this._hasCalledMe
      }));
      // 桌面级消息提示框
      this._browserNotificationHandle(data);
      // TODO: mute notifications switch
    });
  }

  subscribeSocket() {
    // 移除之前所有的私聊、群聊的新消息监听
    window.socket.removeAllListeners('getPrivateMsg');
    window.socket.removeAllListeners('getGroupMsg');
    // 重新监听私聊、群聊的新消息
    this._listeningPrivateChatMsg();
    this._listeningGroupChatMsg();
    console.log('subscribeSocket success');
  }

  // 初始化Socket
  _initSocket = async () => {
    const { token, user_id } = this._userInfo;
    window.socket = io(`${this.WEBSITE_ADDRESS}?token=${token}`);
    const initSocketRes = await this._socket.emit('initSocket', user_id);
    console.log(`${user_id} connect socket success.`, initSocketRes, 'time=>', new Date().toLocaleString());
    const initGroupChatRes = await this._socket.emit('initGroupChat', user_id);
    console.log(initGroupChatRes, 'time=>', new Date().toLocaleString());
  };

  // 初始化聊天消息
  _initMessage = async () => {
    const { user_id } = this._userInfo; // 获取用户id
    // 获取所有聊天消息
    const allMessage = await this._socket.emit('initMessage', {
      user_id,
      clientHomePageList: JSON.parse(localStorage.getItem(`homePageList-${user_id}`))
    });
    const privateChat = new Map(allMessage.privateChat); // 将获取的私聊消息转换为Map
    const groupChat = new Map(allMessage.groupChat); // 将获取的群聊消息转换为Map
    store.dispatch(setHomePageListAction(allMessage.homePageList)); // 复写全局HomePageList
    store.dispatch(setAllPrivateChatsAction({ data: privateChat })); // 复写全局allPrivateChats
    store.dispatch(setAllGroupChatsAction({ data: groupChat })); // 复写全局allGroupChats
  }

  // 初始化聊天
  _init = async () => {
    await this._initSocket();
    this.subscribeSocket();
    await this._initMessage();
  }

  // 初始化
  async init() {
    if (this._userInfo) { // 当前用户信息存在
      await this._init(); // 初始化聊天
      console.log('init app success');
      // 监听后台报错则弹出错误提示框
      window.socket.on('error', (errorMessage) => {
        notification(errorMessage, 'error');
      });
      // 监听重连
      window.socket.on('reconnect', (attemptNumber) => {
        console.log('reconnect successfully. attemptNumber =>', attemptNumber, 'time=>', new Date().toLocaleString());
      });
      // 监听连接失败,重新初始化聊天
      window.socket.on('disconnect', (reason) => {
        console.log('disconnect in client, disconnect reason =>', reason, 'time=>', new Date().toLocaleString());
        this._init();
      });
      // 监听重连错误
      window.socket.on('reconnect_error', (error) => {
        console.log('reconnect_error. error =>', error, 'time=>', new Date().toLocaleString());
      });
    }
  }
}

export default InitApp;
