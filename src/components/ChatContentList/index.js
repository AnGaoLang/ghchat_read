
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Viewer from 'react-viewer'; // 预览图片插件
import ChatItem from '../ChatItem';
import { toNormalTime } from '../../utils/transformTime';
import './styles.scss';
import sleep from '../../utils/sleep';
import notification from '../Notification';

export default class ChatContentList extends Component {
  constructor(props) {
    super(props);
    this._chat = props.chat;
    this._scrollHeight = 0;
    this._userInfo = JSON.parse(localStorage.getItem('userInfo'));
    this._loadingNewMessages = false;
    this._executeNextLoad = true;
    this.state = {
      imageVisible: false,
      imageUrl: null
    };
  }

  componentDidMount() {
    this._chat.scrollToBottom();
  }

  componentWillUpdate() {
    // If It is the bottom of scroll just now, keep it in the bottom.
    if (this._chat.isScrollInBottom) {
      this._chat.scrollToBottom();
    }
  }

  componentDidUpdate(nextProps) {
    if (nextProps.chatId !== this.props.chatId) { // go to another chat
      this._loadingNewMessages = false;
      // this._chat = new Chat();
      this._chat.scrollToBottom();
    }
    if (this._scrollHeight && this._loadingNewMessages) {
      this._ulRef.scrollTop = this._ulRef.scrollHeight - this._scrollHeight;
      this._loadingNewMessages = false;
    }
  }

  _lazyLoadMessage = () => {
    this._executeNextLoad = false;
    const {
      chats, chatId, ChatContent, chatType
    } = this.props;
    if (chatType === 'groupChat') {
      this._chat.lazyLoadGroupMessages({
        chats, chatId, start: ChatContent.length + 1, count: 20
      }).then(() => {
        this._executeNextLoad = true;
      }).catch((error) => {
        if (error === 'try again later') {
          // 延迟3s后 this._executeNextLoad 改为true
          sleep(3000).then(() => {
            this._executeNextLoad = true;
          });
        }
      });
    } else if (chatType === 'privateChat') {
      this._chat.lazyLoadPrivateChatMessages({
        chats,
        user_id: this._userInfo.user_id,
        chatId,
        start: ChatContent.length + 1,
        count: 20
      }).then(() => {
        this._executeNextLoad = true;
      }).catch((error) => {
        if (error === 'try again later') {
          sleep(3000).then(() => {
            this._executeNextLoad = true;
          });
        }
      });
    }
    this._loadingNewMessages = true;
  }

  // 滚动聊天框时的事件监听函数
  _onScroll = (e) => {
     // 若聊天框的dom元素不存在，则直接返回
    if (!this._ulRef) return;
    // 获取聊天框滚动的高度，整体包括被隐藏的高度，视口的高度
    const { scrollTop, scrollHeight, clientHeight } = e && e.target;
    // 整个的高度赋值给this._scrollHeight
    this._scrollHeight = scrollHeight;
    
    // 如果滚动高度为0(再最顶部)，有滚动条，且this._executeNextLoad为true(执行下次加载)
    if (scrollTop === 0 && scrollHeight !== clientHeight && this._executeNextLoad) {
      // 是否加入了当前群组，依据是否根据群组id从allGroupChats里获取了群组相关信息
      if (!this.props.shouldScrollToFetchData) {
        notification('查看更多请先加群哦', 'warn');
        return;
      }
      // 懒加载聊天消息
      this._lazyLoadMessage();
    }
  }

  // 点击图片的处理函数，放大预览图片
  clickImage = (imageUrl) => {
    this.setState({ imageUrl, imageVisible: true });
  }

  // 关闭图片预览
  _closeImageView = () => {
    this.setState({ imageVisible: false });
  }

  render() {
    const { ChatContent, clickAvatar } = this.props;
    const listItems = ChatContent.map((item, index) => {
      let isMe;
      if (item.to_user) { // is private chat
        isMe = this._userInfo && (this._userInfo.user_id === item.from_user);
      } else if (item.to_group_id) { // is group chat
        isMe = this._userInfo && (this._userInfo.user_id === item.from_user);
      }
      let message;
      if (item.message) {
        const beginWithName = /\S.*:\s/.test(item.message);
        message = beginWithName ? item.message.substring(item.name.length + 2) : item.message;
      }
      const time = toNormalTime(item.time);
      // console.log('item.attachments', item.attachments);
      const attachments = item.attachments;
      if (item.tip) {
        return <li className="tip" key={index}>{item.message}</li>;
      }
      return (
        <li key={index}>
          <ChatItem
            me={isMe}
            img={item.avatar}
            msg={message}
            name={item.name}
            time={time}
            github_id={item.github_id}
            clickImage={this.clickImage}
            shouldScrollIntoView={!(this._scrollHeight && this._loadingNewMessages) && !this._chat.isScrollInBottom}
            clickAvatar={() => clickAvatar(item.from_user)}
            attachments={attachments} />
        </li>
      );
    }
    );
    return (
      <ul
        className="chat-content-list"
        ref={(list) => { this._ulRef = list; }}
        onScroll={this._onScroll}
      >
        {/* 图片放大预览 */}
        <Viewer
          visible={this.state.imageVisible}
          noNavbar
          onClose={this._closeImageView}
          images={[{ src: this.state.imageUrl, alt: '' }]}
        />

        {listItems}
      </ul>
    );
  }
}


ChatContentList.propTypes = {
  ChatContent: PropTypes.array,
  chatId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  clickAvatar: PropTypes.func,
  chatType: PropTypes.string.isRequired,
  chats: PropTypes.instanceOf(Map),
  shouldScrollToFetchData: PropTypes.bool,
};


ChatContentList.defaultProps = {
  ChatContent: [],
  chatId: null,
  clickAvatar() {},
  chats: new Map(),
  shouldScrollToFetchData: true,
};
