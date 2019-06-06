import React, { Component } from 'react';
import PropTypes from 'prop-types';
import UserAdapter from '../UserAvatar';
import './styles.scss';
import CreateGroupModal from '../CreateGroupModal';
import notification from '../Notification';

export default class GroupChatInfo extends Component {
  constructor(props) {
    super(props);
    console.log(props)
    this.state = {
      groupMember: [], // 当前群组的成员
      onlineNumber: '--', // 群组内在线的总人数
      modalVisible: false, // modal的显示隐藏
    };
    this._userInfo = JSON.parse(localStorage.getItem('userInfo'));
    this._isCreator = this._userInfo.user_id === parseInt(props.groupInfo.creator_id);
  }

  componentDidMount() {
    const groupId = this.props.chatId;
    // 依据群组id获取群组内的所有成员
    window.socket.emit('getGroupMember', groupId, (data) => {
      data.sort((a, b) => b.status - a.status); // 排序
      const onlineMember = data.filter(e => e.status === 1); // 筛选出在线的成员
      this.setState({
        groupMember: data,
        onlineNumber: onlineMember.length // 在线成员总数量
      });
    });
  }

  // 点击群组成员的处理函数
  _clickMember = (user_id) => {
    this.props.clickMember(user_id); // 父组件传入的点击群组成员的处理函数
  }

  // 显示修改群组的详情弹框
  _openEditorInfoModal = () => {
    this.setState({ modalVisible: true });
  }

  // 显示所有的群组成员
  GroupMemberRender = groupMember => (
    <ul className="members">
      {groupMember.length > 0 && groupMember.map(e => (
        <li key={e.user_id} className="member" onClick={() => this._clickMember(e.user_id)}>
          {/* 显示头像 */}
          <UserAdapter
          src={e.avatar}
          name={e.name}
          isGray={!e.status}
          showLogo={!!e.github_id} />
          <span className="memberName">{e.name}</span>
        </li>
      ))}
    </ul>
  );

  // 修改群资料的确认按钮，
  _confirm = ({ groupName, groupNotice }) => {
    this._closeModal(); // 关闭modal
    this._updateGroupInfo({ groupName, groupNotice }); // 更新更改后的群名和群公告
  }

  // 关闭修改群资料的modal，
  _closeModal= () => {
    this.setState({
      modalVisible: false
    });
  }

  // 更新群资料；groupName：群名；groupNotice：群公告
  _updateGroupInfo = ({ groupName, groupNotice }) => {
    const {
      groupInfo, allGroupChats,
      updateGroupTitleNotice,
      updateListGroupName,
      homePageList
    } = this.props;
    const { to_group_id } = groupInfo;
    const data = {
      name: groupName,
      group_notice: groupNotice,
      to_group_id
    };
    window.socket.emit('updateGroupInfo', data, (res) => {
      updateGroupTitleNotice({
        allGroupChats, groupNotice, groupName, groupId: to_group_id
      });
      updateListGroupName({
        homePageList, name: groupName, to_group_id
      });
      notification(res, 'success');
      this._closeModal();
    });
  }

  render() {
    const { groupMember, onlineNumber, modalVisible } = this.state;
    const { groupInfo, leaveGroup } = this.props;
    return (
      <div className="chatInformation">
        {/* 修改群资料的弹出modal */}
        <CreateGroupModal
          title="修改群资料"
          modalVisible={modalVisible}
          confirm={args => this._confirm(args)}
          hasCancel
          hasConfirm
          cancel={this._closeModal}
          defaultGroupName={groupInfo.name}
          defaultGroupNotice={groupInfo.group_notice}
         />
        <div className="info">
          <p className="noticeTitle">
            群公告
            {this._isCreator && <svg onClick={this._openEditorInfoModal} className="icon iconEditor" aria-hidden="true"><use xlinkHref="#icon-editor" /></svg>}
          </p>
          <p className="noticeContent">{groupInfo.group_notice}</p>
          <p className="memberTitle">
            {`在线人数: ${onlineNumber}`}
          </p>
        </div>
        {this.GroupMemberRender(groupMember)}
        <p className="leave" onClick={leaveGroup}>退出群聊</p>
      </div>
    );
  }


  get userInfo() {
    return JSON.parse(localStorage.getItem('userInfo'));
  }
}

GroupChatInfo.propTypes = {
  leaveGroup: PropTypes.func.isRequired, // 退出群聊的处理函数
  chatId: PropTypes.string.isRequired, // 当前群组id
  clickMember: PropTypes.func, // 点击群组成员的处理函数
  groupInfo: PropTypes.object, // 群组详情信息
  updateGroupTitleNotice: PropTypes.func, // dispatch，更新群组公告
  updateListGroupName: PropTypes.func, // dispatch，更新群组名
  allGroupChats: PropTypes.instanceOf(Map), // 以群组id为key，存储了该群组的详情信息以及所有聊天消息
  homePageList: PropTypes.array, // 聊天列表所有聊天组的数组
};


GroupChatInfo.defaultProps = {
  groupInfo: {},
  updateGroupTitleNotice() {}, // dispatch，更新群组公告
  updateListGroupName() {}, // dispatch，更新群组名
  allGroupChats: new Map(),
  homePageList: [],
};
