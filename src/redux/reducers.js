import { combineReducers } from 'redux';

import robotReducer from '../containers/RobotPage/robotReducer';
import { getHomePageListReducer, relatedCurrentChatReducer } from '../containers/HomePageList/homePageListReducer';
import { initAppReducer } from './reducers/initAppReducer';
import { inviteReducer } from './reducers/inviteReducer';
import { fetchAllGroupChatsReducer } from '../containers/GroupChatPage/groupChatReducer';
import { fetchAllPrivateChatsReducer } from '../containers/PrivateChatPage/privateChatReducer';

// 合并所有的小的reducer，这里的obj结构对应了全局的state的结构，键名一致，键值自动生成
export default combineReducers({
  robotState: robotReducer, // 机器人聊天框初始化的聊天内容
  homePageListState: getHomePageListReducer,
  allGroupChatsState: fetchAllGroupChatsReducer,
  allPrivateChatsState: fetchAllPrivateChatsReducer,
  relatedCurrentChat: relatedCurrentChatReducer,
  initAppState: initAppReducer,
  inviteState: inviteReducer,
});
