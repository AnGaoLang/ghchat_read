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
    this._sendByMe = false;
    this._userInfo = JSON.parse(localStorage.getItem('userInfo'));
    this.state = {
      groupMsgAndInfo: {},
      showGroupChatInfo: false,
      personalInfo: {}, // 要显示的群组成员的详情信息
      showPersonalInfo: false, // 是否显示个人信息详情弹框
      showLeaveGroupModal: false, // 是否显示群组信息详情弹框
      showInviteModal: false // 是否显示邀请分享弹框
    };
    this._chat = new Chat();
    this._didMount = false;
  }

  sendMessage = (inputMsg = '', attachments = []) => {
    console.log(attachments);
    if (inputMsg.trim() === '' && attachments.length === 0) return;
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
      name,
      github_id,
      groupName: this.groupName,
      message: inputMsg === '' ? `${name}: [${attachments[0].type || 'file'}]` : `${name}: ${inputMsg}`, // 消息内容
      attachments, // 附件
      to_group_id: this.chatId,
      time: Date.parse(new Date()) / 1000 // 时间
    };
    this._sendByMe = true;
    window.socket.emit('sendGroupMsg', data);
    addGroupMessages({ allGroupChats, message: data, groupId: this.chatId });
    updateHomePageList({ data, homePageList, myUserId: user_id });
  }

  joinGroup = () => {
    const {
      allGroupChats, homePageList, updateHomePageList, addGroupMessageAndInfo
    } = this.props;
    window.socket.emit('joinGroup', { userInfo: this._userInfo, toGroupId: this.chatId }, (data) => {
      const { messages, groupInfo } = data;
      const name = groupInfo && groupInfo.name;
      let lastContent;
      if (messages.length > 1) {
        lastContent = { ...messages[messages.length - 1], name };
      } else {
        lastContent = {
          ...data.groupInfo,
          message: '加入群成功，开始聊天吧:)',
          time: Date.parse(new Date()) / 1000
        };
      }
      addGroupMessageAndInfo({
        allGroupChats, messages, groupId: this.chatId, groupInfo
      });
      updateHomePageList({ data: lastContent, homePageList });
    }
    );
  }

  // 切换显示群组信息详情弹框
  _showLeaveModal = () => {
    this.setState(state => ({ showLeaveGroupModal: !state.showLeaveGroupModal }));
  }

  leaveGroup = () => {
    const { user_id } = this._userInfo;
    const {
      homePageList, deleteHomePageList, allGroupChats, deleteGroupChat
    } = this.props;
    window.socket.emit('leaveGroup', { user_id, toGroupId: this.chatId });
    deleteHomePageList({ homePageList, chatId: this.chatId });
    deleteGroupChat({ allGroupChats, groupId: this.chatId });
    this.props.history.push('/');
  }

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
    // 依据群组id吗，获取群组
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
    const chatItem = allGroupChats.get(this.chatId);
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
  updateHomePageList: PropTypes.func,
  addGroupMessages: PropTypes.func,
  addGroupMessageAndInfo: PropTypes.func,
  deleteHomePageList: PropTypes.func,
  deleteGroupChat: PropTypes.func,
  updateGroupTitleNotice: PropTypes.func,
  updateListGroupName: PropTypes.func,
  inviteData: PropTypes.object,
};


GroupChat.defaultProps = {
  allGroupChats: new Map(),
  homePageList: [],
  updateHomePageList() {},
  addGroupMessages() {},
  addGroupMessageAndInfo() {},
  deleteHomePageList() {},
  deleteGroupChat() {},
  updateGroupTitleNotice() {},
  updateListGroupName() {},
  inviteData: undefined,
};
