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
      showGroupChatInfo(!hasShowed); // 显示或隐藏群组详情弹框，当前显示则隐藏，当前隐藏则显示
    } else if (chatType === 'private') {
      showPersonalInfo(); // 显示个人详情弹框
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
        {/* 分享按钮，非机器人聊天才显示 */}
        { !isRobotChat && <svg onClick={this._clickInvite} className="icon inviteIcon" aria-hidden="true"><use xlinkHref="#icon-share" /></svg> }
        {/* 当前聊天群组或个人的详细信息显示按钮，非机器人聊天才显示 */}
        { !isRobotChat && <svg onClick={this._clickChatInfo} className="icon information-icon" aria-hidden="true"><use xlinkHref={icon} /></svg>}
      </div>
    );
  }
}

export default withRouter(ChatHeader);

ChatHeader.propTypes = {
  title: PropTypes.string,
  chatType: PropTypes.string.isRequired, // 必须，当前聊天的类型（'group' 或 'private'）
  showGroupChatInfo: PropTypes.func,
  showPersonalInfo: PropTypes.func,
  hasShowed: PropTypes.bool,
};


ChatHeader.defaultProps = {
  title: '', // 聊天框主题的表头文本
  showGroupChatInfo: undefined, // 切换显示群组详情弹框
  showPersonalInfo: undefined, // 切换显示个人详情弹框
  hasShowed: false // 当前群组详情弹框的显示状态
};
