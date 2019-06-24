import { clearUnreadAction } from '../../containers/HomePageList/homePageListAction';
import { addGroupMessagesAction } from '../../containers/GroupChatPage/groupChatAction';
import { addPrivateChatMessagesAction } from '../../containers/PrivateChatPage/privateChatAction';
import { inviteAction } from '../../redux/actions/inviteAction';
import store from '../../redux/store';
import notification from '../../components/Notification';

export default class Chat {
  constructor() {
    this._hasLoadAllMessages = false; // 是否加载了全部消息
  }

  // 点击加载分享弹框
  clickInviteModalItem = ({ homePageList, chatId }) => {
    // 根据id（私人或群组）筛选出当前聊天框内容
    const data = homePageList.filter(e => e.user_id === chatId || e.to_group_id === chatId);
    if (!data) { // 未找到则抛出错误
      throw Error("can't find the date of this item");
    }
    const {
      name,  // 名称
      avatar,  // 头像
      user_id,  // 用户id
      to_group_id  // 群组id
    } = data[0]; // 取出相关信息
    // 分发inviteAction的action改变store
    store.dispatch(inviteAction({
      name, avatar, user_id, to_group_id
    }));
  }

  // 将聊天框滚动到最底部
  scrollToBottom(time = 0) {
    const ulDom = document.querySelector('.chat-content-list');
    if (ulDom) {
      setTimeout(() => {
        ulDom.scrollTop = ulDom.scrollHeight;
      }, time);
    }
  }

  // 清除所有未读消息。unread重置为0
  clearUnreadHandle({ homePageList, chatFromId }) {
    store.dispatch(clearUnreadAction({ homePageList, chatFromId }));
  }

  // 懒加载群组聊天消息
  lazyLoadGroupMessages({
    chats, chatId, start, count
  }) {
    return new Promise((resolve, reject) => {
      if (!this._hasLoadAllMessages) { // 如果没有加载完全部消息
        try {
          // 向后台发送消息（群组id，起始位置索引，返回详细数量）;
          window.socket.emit('getOneGroupMessages', { groupId: chatId, start, count }, (groupMessages) => {
            // 如果后台传给回调的数据为真 且 长度为0，则群组的聊天消息全部加载完成
            if (groupMessages && groupMessages.length === 0) {
              this._hasLoadAllMessages = true;
              notification('已经到底啦', 'warn', 2);
              reject();
            }
            // 分发更新群组的历史聊天消息
            store.dispatch(addGroupMessagesAction({
              allGroupChats: chats, messages: groupMessages, groupId: chatId, inLazyLoading: true
            }));
            resolve();
          });
        } catch (error) {
          // 报错则抛出错误
          console.log(error);
          notification('出错啦，请稍后再试', 'error');
          const errorText = 'try again later';
          reject(errorText);
        }
      }
    });
  }

  // 懒加载私人聊天消息
  lazyLoadPrivateChatMessages({
    chats, user_id, chatId, start, count
  }) {
    return new Promise((resolve, reject) => {
      if (!this._hasLoadAllMessages) {
        window.socket.emit('getOnePrivateChatMessages', {
          user_id, toUser: chatId, start, count
        }, (privateChatMessages) => {
          if (privateChatMessages && privateChatMessages.length === 0) {
            this._hasLoadAllMessages = true;
            notification('已经到底啦', 'warn', 2);
            reject();
          }
          // 分发更新私聊的历史聊天消息
          store.dispatch(addPrivateChatMessagesAction({
            allPrivateChats: chats, messages: privateChatMessages, chatId, inLazyLoading: true
          }));
          resolve('success!');
        });
      }
    });
  }

  // get 拦截isScrollInBottom属性的取值，依据聊天框是否滚动是否最底部，返回布尔值
  get isScrollInBottom() {
    const ulDom = document.getElementsByClassName('chat-content-list')[0];
    if (ulDom) {
      const { scrollTop, offsetHeight, scrollHeight } = ulDom;
      return scrollTop === (scrollHeight - offsetHeight);
    }
    return false;
  }
}
