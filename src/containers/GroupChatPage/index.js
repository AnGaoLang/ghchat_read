import { connect } from 'react-redux';
import {
  withRouter,
} from 'react-router-dom';
import {
  updateHomePageListAction,
  deleteHomePageListAction,
  updateListGroupNameAction,
} from '../HomePageList/homePageListAction';
import {
  addGroupMessagesAction,
  deleteGroupChatAction,
  addGroupInfoAction,
  addGroupMessageAndInfoAction,
  updateGroupTitleNoticeAction,
} from './groupChatAction';
import GroupChat from '../../components/GroupChat';

const mapStateToProps = state => ({
  allGroupChats: state.allGroupChatsState, // 群组本身的信息 以及 有所聊天消息（Map数据结构）
  homePageList: state.homePageListState, // 聊天列表组成的数组
  relatedCurrentChat: state.relatedCurrentChat,
  inviteData: state.inviteState,
});

const mapDispatchToProps = dispatch => ({
  addGroupMessageAndInfo(arg = {}) {
    dispatch(addGroupMessageAndInfoAction({ ...arg }));
  },
  addGroupMessages(arg = {}) {
    dispatch(addGroupMessagesAction({ ...arg }));
  },
  deleteGroupChat(arg = {}) {
    dispatch(deleteGroupChatAction({ ...arg }));
  },
  addGroupInfo(arg = {}) {
    dispatch(addGroupInfoAction({ ...arg }));
  },
  updateHomePageList(arg = {}) {
    dispatch(updateHomePageListAction({ ...arg }));
  },
  deleteHomePageList(arg = {}) {
    dispatch(deleteHomePageListAction({ ...arg }));
  },
  // 更新群公告
  updateGroupTitleNotice(arg = {}) {
    dispatch(updateGroupTitleNoticeAction({ ...arg }));
  },
  // 更新群名
  updateListGroupName(arg = {}) {
    dispatch(updateListGroupNameAction({ ...arg }));
  },
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(GroupChat));
