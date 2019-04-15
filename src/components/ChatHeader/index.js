import React, { Component } from 'react';
import {
  withRouter,
} from 'react-router-dom';
import PropTypes from 'prop-types';
import './style.scss';

class ChatHeader extends Component {
  clickToBack = () => {
    this.props.history.push('/');
  }

  _clickChatInfo = () => {
    const {
      showGroupChatInfo, showPersonalInfo, chatType, hasShowed
    } = this.props;
    if (chatType === 'group') {
      showGroupChatInfo(!hasShowed);
    } else if (chatType === 'private') {
      showPersonalInfo();
    }
  }

  _clickInvite = () => {
    this.props.showInviteModal();
  }

  render() {
    const { title, chatType, } = this.props;
    const icon = chatType === 'group' ? '#icon-group' : '#icon-people';
    const isRobotChat = chatType === 'robot';
    return (
      <div className="chat-header-wrapper">
        <svg onClick={this.clickToBack} className="icon back-icon" aria-hidden="true"><use xlinkHref="#icon-back1" /></svg>
        <div className="chat-title">{title}</div>
        <svg onClick={this._clickInvite} className="icon inviteIcon" aria-hidden="true"><use xlinkHref="#icon-share" /></svg>
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
