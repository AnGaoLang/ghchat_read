import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { toNormalTime } from '../../utils/transformTime';
import UserAvatar from '../UserAvatar';
import GroupAvatar from '../GroupAvatar';
import './styles.scss';

// eslint-disable-next-line react/prefer-stateless-function
class ListItems extends Component {

  // 点击聊天列表，改变相应的路由，显示聊天详情
  // chatFromId: 聊天组的id； isGroupChat：是否是群组
  _clickItem = ({ chatFromId, isGroupChat }) => {
    this.props.clickItem(chatFromId);
    const chatUrl = isGroupChat ? `/group_chat/${chatFromId}` : `/private_chat/${chatFromId}`;
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

     // 除开机器人的聊天列表(群组/私人聊天)，依据 dataList 进行映射
    const listItems = dataList && dataList.map((data, index) => {
      let message = data.message;
      const isInviteUrl = message && /::invite::{"/.test(message);
      if (isInviteUrl) {
        message = '[邀请卡片]';
      }
      const chatFromId = data.to_group_id || (data.user_id && data.user_id.toString());
      const isGroupChat = !!data.to_group_id;
      let GroupMembers;
      if (isGroupChat) {
        const chatItem = allGroupChats && allGroupChats.get(data.to_group_id);
        GroupMembers = chatItem && chatItem.groupInfo && chatItem.groupInfo.members;
      }
      const { params } = match;
      const unreadColor = data.to_group_id ? 'groupUnread' : 'privateUnread';
      let unreadCircular;
      switch (data.unread && (data.unread).toString().length) {
        case 2:
          unreadCircular = 'twoDigitsUnread';
          break;
        case 3:
          unreadCircular = 'threeDigitsUnread';
          break;
        default:
          unreadCircular = 'oneDigitUnread';
      }
      return (
        <li
          key={index}
          style={!showAsContacts && (params.user_id || params.to_group_id) === chatFromId ? { backgroundColor: '#f5f5f5' } : {}}
          onClick={() => this._clickItem({ chatFromId, isGroupChat })}
          value={chatFromId}>
          { isGroupChat
            ? <GroupAvatar members={GroupMembers || []} />
            : <UserAvatar src={data.avatar} name={data.name} size="46" showLogo={!!data.github_id} />}

          {!!data.unread && !showAsContacts && (
            <span className={classnames(unreadColor, unreadCircular)}>
              {data.unread > 99 ? '99+' : data.unread}
            </span>
          )}

          <div className="content">
            <div className="title">
              <p className="name">{data.name}</p>
              {!showAsContacts
                && (
                <span className="time">{!!data.time && toNormalTime(data.time)}</span>
                )}
            </div>
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
        {/* 机器人 */}
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
  allGroupChats: new Map(),
  dataList: [], // 聊天列表数组
  showRobot: false, // 是否显示机器人聊天列表
  clickItem() {}, // 点击事件的触发函数
  isSearching: false, // 是否搜索
  showAsContacts: false
};
