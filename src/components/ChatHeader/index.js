import React, { Component } from 'react';
import {
  withRouter,
} from 'react-router-dom';
import PropTypes from 'prop-types';
import './style.scss';

class ChatHeader extends Component {
  clickToBack = () => {
    this.props.history.push('/'); // 退回到首页
  }

  _clickChatInfo = () => {
    const {
      showGroupChatInfo, showPersonalInfo, chatType, hasShowed
    } = this.props;
    if (chatType === 'group') {
      showGroupChatInfo(!hasShowed); // 显示或隐藏群组聊天框信息
    } else if (chatType === 'private') {
      showPersonalInfo(); // 显示个人聊天框信息
    }
  }

  _clickInvite = () => {
    this.props.showInviteModal(); // 父组件传递进来的分享弹框
  }

  render() {
    const { title, chatType, } = this.props; // 右侧聊天框的标题和类型
    const icon = chatType === 'group' ? '#icon-group' : '#icon-people'; // 群组聊天框和单人聊天框
    const isRobotChat = chatType === 'robot'; // 是否是机器人聊天框
    return (
      <div className="chat-header-wrapper">
        <svg onClick={this.clickToBack} className="icon back-icon" aria-hidden="true"><use xlinkHref="#icon-back1" /></svg>
        <div className="chat-title">{title}</div>
        {/* share */}
        { !isRobotChat && <svg onClick={this._clickInvite} className="icon inviteIcon" aria-hidden="true"><use xlinkHref="#icon-share" /></svg> }
        {/* chatInfo */}
        { !isRobotChat && <svg onClick={this._clickChatInfo} className="icon information-icon" aria-hidden="true"><use xlinkHref={icon} /></svg>}
      </div>
    );
  }
}

export default withRouter(ChatHeader);

ChatHeader.propTypes = {
  title: PropTypes.string,
  history: PropTypes.object,
  chatType: PropTypes.string.isRequired,
  showGroupChatInfo: PropTypes.func,
  showPersonalInfo: PropTypes.func,
  hasShowed: PropTypes.bool,
};


ChatHeader.defaultProps = {
  title: '',
  history: undefined,
  showGroupChatInfo: undefined,
  showPersonalInfo: undefined,
  hasShowed: false
};
