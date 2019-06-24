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
    const data = homePageList.filter(e => e.user_id === chatId || e.to_group_id === chatId);
    if (!data) {
      throw Error("can't find the date of this item");
    }
    const {
      name, avatar, user_id, to_group_id
    } = data[0];
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

  clearUnreadHandle({ homePageList, chatFromId }) {
    store.dispatch(clearUnreadAction({ homePageList, chatFromId }));
  }

  // 懒加载群组聊天消息
  lazyLoadGroupMessages({
    chats, chatId, start, count
  }) {
    return new Promise((resolve, reject) => {
      if (!this._hasLoadAllMessages) {
        try {
          window.socket.emit('getOneGroupMessages', { groupId: chatId, start, count }, (groupMessages) => {
            if (groupMessages && groupMessages.length === 0) {
              this._hasLoadAllMessages = true;
              notification('已经到底啦', 'warn', 2);
              reject();
            }
            store.dispatch(addGroupMessagesAction({
              allGroupChats: chats, messages: groupMessages, groupId: chatId, inLazyLoading: true
            }));
            resolve();
          });
        } catch (error) {
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
