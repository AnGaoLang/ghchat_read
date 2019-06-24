import React, { Component } from 'react';
import {
  withRouter,
} from 'react-router-dom';
import PropTypes from 'prop-types';
import { Emoji } from 'emoji-mart';
import { MultiLineParser } from 'text-emoji-parser';
import UserAvatar from '../UserAvatar';
import './style.scss';
import Button from '../Button';
import Chat from '../../modules/Chat';

class ChatItem extends Component {
  constructor(props) {
    super(props);
    this._scrollIntoView = null;
    this._chat = new Chat();
  }

  // 点击邀请链接跳转
  clickToInvite({ redirectUrl }) {
    this.props.history.push(redirectUrl);
  }

  // 点击图片的处理函数(放大预览图片)
  _clickImage(imageUrl) {
    this.props.clickImage(imageUrl);
  }

  // 个人邀请
  invitePersonalCard = (inviteObj) => {
    const { name, avatar, user_id } = inviteObj;
    const redirectUrl = `/private_chat/${user_id}`;
    return (
      <div
        className="inviteCard"
        onClick={() => { this.clickToInvite({ redirectUrl }); }}
        >
        <p className="inviteTitle">
          {` "${decodeURI(name)}"`}
        </p>
        <p className="inviteButton">点击加为联系人</p>
      </div>
    );
  }

  // 群组邀请
  inviteGroupCard = (inviteObj) => {
    const { name, to_group_id } = inviteObj;
    const redirectUrl = `/group_chat/${to_group_id}`;
    return (
      <div
        className="inviteCard"
        onClick={() => { this.clickToInvite({ redirectUrl }); }}
        >
        <p>
          邀请你加入群:
        </p>
        <p className="inviteTitle">
          {` "${decodeURI(name)}"`}
        </p>
        <p className="inviteButton">点击加入</p>
      </div>
    );
  }

  // 图片加载完成后的回调
  _onloadImg = () => {
    // TODO: just the latest image should scrollIntoView.
    clearTimeout(this._scrollIntoView);
    this._scrollIntoView = setTimeout(() => {
      const imgDom = document.querySelectorAll('.image-render');
      if (imgDom[imgDom.length - 1] && this.props.shouldScrollIntoView) {
        imgDom[imgDom.length - 1].scrollIntoView();
        this._chat.scrollToBottom();
      }
    }, 0);
  }

  // 渲染上传的文本,msg为聊天的对话内容
  textRender = (msg) => {
    const isInviteUrl = /^::invite::{"/.test(msg); // 对话内容中是否包含邀请信息
    if (isInviteUrl) {
      const inviteObj = JSON.parse(msg.replace(/::invite::/, '')); // 去掉/::invite::/
      if (inviteObj.to_group_id) { // 若是群组邀请
        return <div className="msg-render">{this.inviteGroupCard(inviteObj)}</div>;
      } if (inviteObj.user_id) { // 若是个人邀请
        return <div className="msg-render">{this.invitePersonalCard(inviteObj)}</div>;
      }
    }
    // 若没有包含邀请内容,包含emoj表情的处理
    return (
      <div className="msg-render">
        {/* 第一个参数：传入msg，包含emoj表情字符串实体的一段字符串，
            第二个参数：SplitLinesTag用什么html标签包裹所有内容，Rule固定的正则匹配 
            第三个参数：一个回调函数，rule是被正则捕获的emoj字符串，ruleNumber被捕获的emoj字符串的索引(第几个emoj)，返回一个html节点或则react节点*/}
        {MultiLineParser(msg,
          {
            SplitLinesTag: 'p',
            Rule: /(?:\:[^\:]+\:(?:\:skin-tone-(?:\d)\:)?)/gi
          },
          (Rule, ruleNumber) => {
            {/* console.log(Rule)
            console.log(ruleNumber) */}
            {/* 将emoj字符实体作为一个图像显示 */}
            return (<Emoji
              className="msg-render"
              emoji={Rule}
              backgroundImageFn={() => 'https://cdn.aermin.top/emojione.png'}
              size={26}
              fallback={(emoji, props) => (emoji ? `:${emoji.short_names[0]}:` : props.emoji)} />
          )})
    }
      </div>
    );
  };

  // 渲染上传的文件
  filesRender = attachments => attachments.map((attachment) => {
    // 如果上传的是图片
    if (attachment.type === 'image') {
      // 渲染图片
      return (
        <div className="image-render" key={attachment.fileUrl} onClick={() => { this._clickImage(attachment.fileUrl); }}>
          <img src={attachment.fileUrl} onLoad={this._onloadImg} />
        </div>
      );
    }
    // 否则下载文件，(文件名 或 'unknown file')
    return (
      <a
        key={attachment.fileUrl}
        download
        href={attachment.fileUrl}
        className="other-file-render"
      >
        {attachment.name || 'unknown file'}
        <svg className="icon" aria-hidden="true"><use xlinkHref="#icon-download" /></svg>
      </a>
    );
  })

  render() {
    // msg为聊天的对话内容
    const {
      me, img, time, name, msg, clickAvatar, github_id
    } = this.props; // 父组件传递下来的，聊天对话框的必要信息
    // 上传的文件
    let attachments = this.props.attachments;
    if (typeof attachments === 'string') {
      // attachments是字符串，则格式化
      attachments = JSON.parse(attachments);
    }
    // TODO: reduce needless render
    // console.log('attachments in chatItem', attachments);

    return (
      <div className="chat-item">
        {/* me为真则是当前用户发送的聊天消息，否则为机器人发送的消息 */}
        {me ? (
          <div className="mychat">
            {/* 用户头像 */}
            <UserAvatar name={name} src={img} size="40" showLogo={!!github_id} />
            {/* 用户名和时间 */}
            <div className="nt">
              {time && <span>{time}</span>}
              {name && <span>{name}</span>}
            </div>
            {/* attachments长度大于0则显示包含上传文件的聊天框对话内容
                反之，选择纯文本的聊天内容 */}
            {attachments.length ? this.filesRender(attachments)
              : this.textRender(msg)
            }
          </div>
        ) : (
          <div className="otherchat">
            <UserAvatar name={name} src={img} size="40" clickAvatar={clickAvatar} showLogo={!!github_id} />
            <div className="nt">
              {name && <span>{ name }</span>}
              {time && <span>{ time }</span>}
            </div>
            {attachments.length ? this.filesRender(attachments)
              : this.textRender(msg)
            }
          </div>
        )}
      </div>
    );
  }
}

export default withRouter(ChatItem);

ChatItem.propTypes = {
  me: PropTypes.bool,
  img: PropTypes.string,
  name: PropTypes.string,
  time: PropTypes.string,
  msg: PropTypes.string,
  attachments: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array
  ]),
  clickAvatar: PropTypes.func,
  github_id: PropTypes.number,
  shouldScrollIntoView: PropTypes.bool,
  clickImage: PropTypes.func,
};

ChatItem.defaultProps = {
  me: undefined, // 是否为当前用户发出的消息
  img: undefined, // 图片
  name: '', // 聊天消息上方的名字
  time: undefined, // 发送时间
  clickAvatar: undefined, // 点击头像的处理函数
  msg: '', // 发送的聊天消息
  attachments: '[]', // 上传的文件的必要信息组成的数组
  github_id: null, // github_id
  shouldScrollIntoView: true,
  clickImage() {}, // 点击图片的处理函数
};
