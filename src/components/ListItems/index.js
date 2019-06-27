import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { toNormalTime } from '../../utils/transformTime'; // 格式化时间
import UserAvatar from '../UserAvatar'; // 用户头像组件
import GroupAvatar from '../GroupAvatar'; // 群组头像组件
import './styles.scss';

// eslint-disable-next-line react/prefer-stateless-function
class ListItems extends Component {

  // 点击聊天列表，跳转到相应的路由，显示聊天详情
  // chatFromId: 聊天组的id； isGroupChat：是否是群组
  _clickItem = ({ chatFromId, isGroupChat }) => {
    this.props.clickItem(chatFromId); // 根据chatFromId进行邀请
    const chatUrl = isGroupChat ? `/group_chat/${chatFromId}` : `/private_chat/${chatFromId}`; // 跳转
    this.props.history.push(chatUrl);
  }

  render() {

    // 机器人的聊天列表
    const robotChat = (
      // 若是选中，则改变样式
      <li
        key="-1"
        style={this.props.match.path === '/robot_chat' ? { backgroundColor: '#f5f5f5' } : {}}
      >
      {/* 将当前页面的url导向机器人聊天页，右侧聊天框显示机器人的聊天详情 */}
        <Link to="/robot_chat">
          <UserAvatar
            name="机器人小R"
            size="46" />
          <div className="content">
            <span className="title robotTitle">
              机器人小R
            </span>
          </div>
        </Link>
      </li>
    );

    // 从props获取信息
    const {
      dataList, allGroupChats, match,
      showRobot, isSearching, showAsContacts
    } = this.props;
    // console.log(dataList)
     // 除开机器人的聊天列表(群组/私人聊天)，依据 dataList 进行映射
    const listItems = dataList && dataList.map((data, index) => {
      // 显示在聊天列表上的最新一条信息
      let message = data.message;
      // message里包含邀请信息，则将message临时改为'[邀请卡片]'
      const isInviteUrl = message && /::invite::{"/.test(message);
      if (isInviteUrl) {
        message = '[邀请卡片]';
      }

      // 获取 聊天群组的id 或者 私人聊天的id
      const chatFromId = data.to_group_id || (data.user_id && data.user_id.toString());
      // 存在群组聊天的id，isGroupChat 则为true
      const isGroupChat = !!data.to_group_id;
      let GroupMembers; // 当前群组内所有群成员
      if (isGroupChat) {
        // allGroupChats是一个Map,以群组的to_group_id为键，储存着所有群组信息及其聊天消息
        const chatItem = allGroupChats && allGroupChats.get(data.to_group_id); // 以to_group_id获取当前群组
        // 若当前群组在allGroupChats中存在，且存在当前群组信息，则获取当前群组的成员组成的数组
        GroupMembers = chatItem && chatItem.groupInfo && chatItem.groupInfo.members;
        // console.log(allGroupChats)
        // console.log(chatItem)
        // console.log(GroupMembers)
      }

      // 当前页面路由
      const { params } = match;
       // 聊天列表上，群组和私人聊天未读消息的样式
      const unreadColor = data.to_group_id ? 'groupUnread' : 'privateUnread';
      // 维度消息气泡提示框样式
      let unreadCircular;
      switch (data.unread && (data.unread).toString().length) { // 未读消息不为0，且判断数字的位数(number转为string)
        case 2:
          unreadCircular = 'twoDigitsUnread';
          break;
        case 3:
          unreadCircular = 'threeDigitsUnread';
          break;
        default:
          unreadCircular = 'oneDigitUnread';
      }
      // showAsContacts 为假时才显示气泡提示框，事件、@提示（只有在邀请显示为相关联系人的情况下，showAsContacts才为真）
      return (
        // 当前页面的 url 的群组或个人id 与聊天列表的id进行比对，相等则改变为被选中样式
        <li
          key={index}
          style={!showAsContacts && (params.user_id || params.to_group_id) === chatFromId ? { backgroundColor: '#f5f5f5' } : {}}
          onClick={() => this._clickItem({ chatFromId, isGroupChat })}
          value={chatFromId}>

          {/* 群组的头像 */}
          { isGroupChat
            ? <GroupAvatar members={GroupMembers || []} />
            : <UserAvatar src={data.avatar} name={data.name} size="46" showLogo={!!data.github_id} />
          }

          {/* 未读消息的提示气泡 */}
          {!!data.unread && !showAsContacts && (
            <span className={classnames(unreadColor, unreadCircular)}>
              {data.unread > 99 ? '99+' : data.unread}
            </span>
          )}

          {/* 头像右边的：群组名称、最新消息日期、最新消息发送人、 最新消息、未读提示气泡框、@提示*/}
          <div className="content">
            <div className="title">
              <p className="name">{data.name}</p>
              {!showAsContacts
                && (
                <span className="time">{!!data.time && toNormalTime(data.time)}</span>
                )}
            </div>
            
            {/* 最新聊天消息，data.showCallMeTip为true，有人@时，则在前面显示提示 */}
            {!showAsContacts
              && (
              <div className="message">
                { data.showCallMeTip && <span className="callMe">[有人@我]</span> }
                {message || '暂无消息'}
              </div>
            )}
          </div>
        </li>
      );
    });
    return (
      <ul className="homePageList">
        {/* 机器人 且没有搜索 */}
        {showRobot && !isSearching && robotChat}
        {/* 群组或个人 */}
        {listItems}
      </ul>
    );
  }
}

export default withRouter(ListItems);

ListItems.propTypes = {
  allGroupChats: PropTypes.instanceOf(Map),
  dataList: PropTypes.array,
  showRobot: PropTypes.bool,
  clickItem: PropTypes.func,
  match: PropTypes.object.isRequired,
  isSearching: PropTypes.bool,
  showAsContacts: PropTypes.bool,
};

ListItems.defaultProps = {
  allGroupChats: new Map(), // 全部群组的的相关信息(包括群组自身信息，以及消息列表)
  dataList: [], // 聊天列表数组
  showRobot: false, // 是否显示机器人聊天列表
  clickItem() {}, // 点击事件的触发函数（邀请的处理函数）
  isSearching: false, // 是否搜索
  showAsContacts: false // 是否在邀请弹框中，显示为相关联系人
};
