import React, { Component } from 'react';
import {
  withRouter,
} from 'react-router-dom';
import PropTypes from 'prop-types';
import ChatHeader from '../ChatHeader';
import InputArea from '../InputArea';
import ChatContentList from '../ChatContentList';
import GroupChatInfo from '../GroupChatInfo';
import Modal from '../Modal';
import InviteModal from '../InviteModal';
import PersonalInfo from '../PersonalInfo';
import notification from '../Notification';
import Chat from '../../modules/Chat';
import './styles.scss';

class GroupChat extends Component {
  constructor(props) {
    super(props);
    this._sendByMe = false; // 是否为当前用户发送的消息
    this._userInfo = JSON.parse(localStorage.getItem('userInfo')); // 当前用户的信息
    this.state = {
      groupMsgAndInfo: {},
      showGroupChatInfo: false,
      personalInfo: {}, // 要显示的群组成员的详情信息
      showPersonalInfo: false, // 是否显示个人信息详情弹框
      showLeaveGroupModal: false, // 是否显示群组信息详情弹框
      showInviteModal: false // 是否显示邀请分享弹框
    };
    this._chat = new Chat(); // 实例化Chat聊天类
    this._didMount = false; // 页面是否挂载完成
  }

  sendMessage = (inputMsg = '', attachments = []) => { // 发送的文本消息(inputMsg)、图片、文件(attachments)
     // 去除文件消息的空字符串仍未空字符传 且 未上传图片或文件，直接返回
    if (inputMsg.trim() === '' && attachments.length === 0) return;
    // 取出用户id， 头像， 昵称，github_id
    const {
      user_id, avatar, name, github_id
    } = this._userInfo;
    const {
      allGroupChats, homePageList,
      updateHomePageList, addGroupMessages,
    } = this.props;
    const data = {
      from_user: user_id, // 自己的id
      avatar, // 自己的头像
      name, // 昵称
      github_id,
      groupName: this.groupName, // 群组名称
      message: inputMsg === '' ? `${name}: [${attachments[0].type || 'file'}]` : `${name}: ${inputMsg}`, // 消息内容，消息为空则为图片或文件
      attachments, // 附件（图片或文件）
      to_group_id: this.chatId, //群组id
      time: Date.parse(new Date()) / 1000 // 当前时间发送
    };
    this._sendByMe = true; // 当前用户发送的消息
    window.socket.emit('sendGroupMsg', data); // 向后台传递群组消息
    addGroupMessages({ allGroupChats, message: data, groupId: this.chatId }); // 添加新的群组消息
    updateHomePageList({ data, homePageList, myUserId: user_id }); // 更新左侧用户群组列表的显示的最新消息
  }

  // 加入群组
  joinGroup = () => {
    const {
      allGroupChats, homePageList, updateHomePageList, addGroupMessageAndInfo
    } = this.props;
    // 向后台发送加入群组的消息，并带上当前用户信息、要加入的群组id。
    window.socket.emit('joinGroup', { userInfo: this._userInfo, toGroupId: this.chatId }, (data) => {
      const { messages, groupInfo } = data; // 获取最新消息和群组信息
      const name = groupInfo && groupInfo.name; // 群组名称
      let lastContent; // 最新消息
      if (messages.length > 1) {
        lastContent = { ...messages[messages.length - 1], name }; // 已加入群组，则更新最新消息
      } else {
        // 加入群组后，显示最新的加入成功消息
        lastContent = {
          ...data.groupInfo,
          message: '加入群成功，开始聊天吧:)',
          time: Date.parse(new Date()) / 1000
        };
      }
      // 添加群组信息及聊天消息
      addGroupMessageAndInfo({
        allGroupChats, messages, groupId: this.chatId, groupInfo
      });
      updateHomePageList({ data: lastContent, homePageList }); // 更新homPageilist
    }
    );
  }

  // 切换显示群组信息详情弹框
  _showLeaveModal = () => {
    this.setState(state => ({ showLeaveGroupModal: !state.showLeaveGroupModal }));
  }

  // 离开群组
  leaveGroup = () => {
    const { user_id } = this._userInfo;
    const {
      homePageList, deleteHomePageList, allGroupChats, deleteGroupChat
    } = this.props;
    window.socket.emit('leaveGroup', { user_id, toGroupId: this.chatId }); // 向后台发送离开当前群组的消息
    deleteHomePageList({ homePageList, chatId: this.chatId }); // 从homePageList中删除
    deleteGroupChat({ allGroupChats, groupId: this.chatId }); // 从allGroupChats中删除
    this.props.history.push('/'); // 跳到根目录i
  }

  // 更改群组详情弹框显示状态
  _showGroupChatInfo(value) {
    this.setState({ showGroupChatInfo: value });
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { relatedCurrentChat, match } = nextProps;
    if (relatedCurrentChat || match.params.to_group_id !== this.chatId || this._sendByMe) {
      this._sendByMe = false;
      return true;
    }

    const { showGroupChatInfo, showPersonalInfo, showLeaveGroupModal } = nextState;
    if (showGroupChatInfo !== this.state.showGroupChatInfo
       || showPersonalInfo !== this.state.showPersonalInfo
       || showLeaveGroupModal !== this.state.showLeaveGroupModal
    ) return true;

    return false;
  }

  // 根据value，切换显示个人信息详情弹框
  _showPersonalInfo(value) {
    this.setState({ showPersonalInfo: value });
  }

  // 点击群组内成员，显示成员的详情modal
  _clickPersonAvatar = (user_id) => {
    const { allGroupChats } = this.props; 
    const { members } = allGroupChats.get(this.chatId).groupInfo; // 依据群组id，获取群组的详情信息内的members(群组成员)
    const personalInfo = members.filter(member => member.user_id === user_id)[0]; // 依据传入的 user_id 筛选出被点击的群组成员的信息
    // 如果不存在，则显示提示消息
    if (!personalInfo) {
      notification('此人已不在群中啦', 'warn', 1.5);
      return;
    };
    this.setState({ personalInfo }, () => {
      // 显示成员详情modal
      this._showPersonalInfo(true);
    });
  }

  componentDidMount() {
    const {
      allGroupChats,
    } = this.props;
    // 依据群组id，获取当前群组，据此判断当前用户是否为该群组内的成员
    const chatItem = allGroupChats && allGroupChats.get(this.chatId);
    // (产品设计) 当查找没加过的群，点击去没群内容，请求出群内容，避免不了解而加错群
    if (!chatItem) {
      window.socket.emit('getOneGroupItem', { groupId: this.chatId, start: 1 }, (groupMsgAndInfo) => {
        this.setState({ groupMsgAndInfo });
      });
    }
    this._didMount = true;
  }

  // 获取当前群组id
  get chatId() {
    // eslint-disable-next-line react/prop-types
    return this.props.match.params.to_group_id;
  }

  // 切换显示邀请分享弹框 
  _showInviteModal = () => {
    this.setState(state => ({ showInviteModal: !state.showInviteModal }));
  }

  render() {
    const {
      allGroupChats,
      updateGroupTitleNotice, // 父包装组件传递下来的dispatch
      updateListGroupName, // 父包装组件传递下来的dispatch
      homePageList,
      inviteData,
    } = this.props;
    const {
      groupMsgAndInfo, showGroupChatInfo,
      showLeaveGroupModal, personalInfo,
      showPersonalInfo,
      showInviteModal
    } = this.state;
    if (!allGroupChats && !allGroupChats.size) return null;
    const chatItem = allGroupChats.get(this.chatId); // 依据群组id，获取当前群组，据此判断当前用户是否为该群组内的成员
    const messages = chatItem ? chatItem.messages : groupMsgAndInfo.messages;
    const groupInfo = chatItem ? chatItem.groupInfo : groupMsgAndInfo.groupInfo;
    return (
      <div className="chat-wrapper">
        <ChatHeader
          title={groupInfo && groupInfo.name || '----'}
          chatType="group"
          hasShowed={showGroupChatInfo}
          showInviteModal={this._showInviteModal}
          showGroupChatInfo={value => this._showGroupChatInfo(value)}
        />
        <Modal
          title="确定退出此群？"
          visible={showLeaveGroupModal}
          confirm={this.leaveGroup}
          hasCancel
          hasConfirm
          cancel={this._showLeaveModal}
         />
        <InviteModal
          title="分享此群给"
          modalVisible={showInviteModal}
          chatId={this.chatId}
          showInviteModal={this._showInviteModal}
          cancel={this._showInviteModal}
          allGroupChats={allGroupChats}
          homePageList={homePageList}
          clickInviteModalItem={this._chat.clickInviteModalItem}
         />

        {/* 群组成员的详情弹框 */}
        <PersonalInfo
          userInfo={personalInfo}
          hide={() => this._showPersonalInfo(false)}
          modalVisible={chatItem && showPersonalInfo} />
          
        <ChatContentList
          chat={this._chat}
          chats={allGroupChats}
          ChatContent={messages}
          shouldScrollToFetchData={!!chatItem}
          chatId={this.chatId}
          chatType="groupChat"
          clickAvatar={user_id => this._clickPersonAvatar(user_id)}
        />
        
        {/* 点击遮罩层隐藏群组详情弹框 */}
        { showGroupChatInfo && <div onClick={() => this._showGroupChatInfo(false)} className="groupChatInfoMask" />}
        {/* 群组详情弹框 updateGroupTitleNotice、updateListGroupName 为父包装组件传递下来的dispatch*/}
        { showGroupChatInfo && (
        <GroupChatInfo
          groupInfo={groupInfo}
          allGroupChats={allGroupChats}
          homePageList={homePageList}
          leaveGroup={this._showLeaveModal}
          clickMember={user_id => this._clickPersonAvatar(user_id)}
          updateGroupTitleNotice={updateGroupTitleNotice}
          updateListGroupName={updateListGroupName}
          chatId={this.chatId} />
        )}

        {/* chatItem为真则渲染输入框，为假则渲染加入群组的按钮 */}
        { chatItem ? (
          <InputArea
            inviteData={inviteData}
            sendMessage={this.sendMessage}
            groupMembers={groupInfo.members} />
        )
          : this._didMount && (
            <input
              type="button"
              onClick={this.joinGroup}
              className="button"
              value="加入群聊"
              />
          )}
      </div>
    );
  }
}

export default withRouter(GroupChat);


GroupChat.propTypes = {
  allGroupChats: PropTypes.instanceOf(Map), // 以群组id为key，存储了该群组的详情信息以及所有聊天消息
  homePageList: PropTypes.array, // 聊天列表所有聊天组的数组
  updateHomePageList: PropTypes.func, // 更新左侧的用户群组列表的相关信息
  addGroupMessages: PropTypes.func, // 新增群组消息
  addGroupMessageAndInfo: PropTypes.func,
  deleteHomePageList: PropTypes.func, // 删除左侧指定chatId的用户群组列表
  deleteGroupChat: PropTypes.func, // 删除指定groupId的群组聊天
  updateGroupTitleNotice: PropTypes.func,
  updateListGroupName: PropTypes.func,
  inviteData: PropTypes.object, // 邀请相关数据
};


GroupChat.defaultProps = {
  allGroupChats: new Map(), // 以群组id为key，存储了该群组的详情信息以及所有聊天消息
  homePageList: [], // 聊天列表所有聊天组的数组，即左侧的用户群组列表
  updateHomePageList() {}, // 更新左侧的用户群组列表的相关信息
  addGroupMessages() {}, // 新增群组消息
  addGroupMessageAndInfo() {},
  deleteHomePageList() {}, // 删除左侧指定chatId的用户群组列表
  deleteGroupChat() {}, // 删除指定groupId的群组聊天
  updateGroupTitleNotice() {},
  updateListGroupName() {},
  inviteData: undefined, // 邀请相关数据
};
