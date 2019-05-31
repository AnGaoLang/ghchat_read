import React, { Component } from 'react';
import '../../assets/chat.scss';
import PropTypes from 'prop-types';
import ChatHeader from '../ChatHeader';
import ChatItem from '../ChatItem';
import InputArea from '../InputArea';

import {
  toNormalTime
} from '../../utils/transformTime';

export default class Robot extends Component {
  constructor() {
    super();
    this._userInfo = JSON.parse(localStorage.getItem('userInfo'));
    this.state = {
      inputMsg: '', // 输入框输入的信息
    };
  }

  // 聊天内容列表滚动到底部，time为设置的延迟的时间
  scrollToBottom(time = 0) {
    const ulDom = document.getElementsByClassName('chat-content-list')[0];
    setTimeout(() => {
      ulDom.scrollTop = ulDom.scrollHeight + 10000; // scrollTop滚动距离设为最底部
    }, time);
  }

  // 发送消息,_sendMessage子组件传入的attachments被忽略了
  sendMessage = async (value) => {
    this.setState({
        inputMsg: value
      }, async () => {
        const { insertMsg, getRobotMsg } = this.props;
        const { inputMsg } = this.state;
        insertMsg({ message: inputMsg }); // 机器人聊天内容插入消息。没有user_id
        this.scrollToBottom(); // 滚动到底部
        // 获取机器人的自动回复，并插入聊天内容
        await getRobotMsg({
            message: inputMsg,
            user_id: this._userInfo.user_id
        });
        this.scrollToBottom(); // 滚动到底部
      });
    }

    componentDidMount() {
      // 初始化渲染时滚动到底部
      this.scrollToBottom(200);
    }

    // 减少重新渲染，每次聊天内容更新时再进行渲染
    shouldComponentUpdate(nextProps) {
      const { robotState } = this.props;
      if (nextProps.robotState === robotState) { // 当props传下来的robotState改变时才重新渲染
        return false;
      }
      return true;
    }

    render() {
      const { robotState } = this.props; // 获取具体聊天消息
      console.log(robotState);
      // 聊天消息列表，重新映射一个jsx数组，msg.user存在则为机器人发送的消息，反之为用户发送的消息
      const listItems = robotState.map((msg, index) => (
        <li key={index}>
          {msg.user && (
          <ChatItem
            msg={msg.message}
            name={msg.user}
            clickAvatar={() => {console.log('机器人头像触发事件')}}
            time={toNormalTime(Date.parse(new Date()) / 1000)} />
          )}
          {!msg.user && (
          <ChatItem
            me
            img={this._userInfo.avatar}
            msg={msg.message}
            name={this._userInfo.name}
            time={toNormalTime(Date.parse(new Date()) / 1000)} />
          )}
        </li>
      ));

      return (
        <div className="chat-wrapper">
          <ChatHeader title="机器人聊天" chatType="robot" />
          <ul className="chat-content-list">
            {listItems}
          </ul>
          <InputArea sendMessage={this.sendMessage} isRobotChat />
        </div>
      );
    }
}

Robot.propTypes = {
  insertMsg: PropTypes.func,
  getRobotMsg: PropTypes.func,
  robotState: PropTypes.array,
};

Robot.defaultProps = {
  insertMsg: undefined, // 输入框消息
  getRobotMsg: undefined, //// 获取机器人的自动回复
  robotState: [], // 和机器人聊天的聊天消息列表
};
