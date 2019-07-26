import {
  SET_ALL_GROUP_CHATS, // 直接设置并替换 群组信息及聊天消息
  ADD_GROUP_MESSAGES, // 新增群组聊天信息
  DELETE_GROUP_CHAT, // // 删除群信息及聊天
  ADD_GROUP_INFO, // 更新群公告的action
  ADD_GROUP_MESSAGE_AND_INFO, // 新增群组自身信息 和 聊天信息
  UPDATE_GROUP_TITLE_NOTICE, // 更新群名和群公告
} from './groupChatAction';

// 群组本身的信息，以及所有的消息列表的reducer
const fetchAllGroupChatsReducer = (previousState = new Map(), action) => {
  switch (action.type) {
    case SET_ALL_GROUP_CHATS:
    case ADD_GROUP_MESSAGES:
    case DELETE_GROUP_CHAT:
    case ADD_GROUP_INFO:
    case ADD_GROUP_MESSAGE_AND_INFO:
    case UPDATE_GROUP_TITLE_NOTICE:
    console.log(action.data)
      return action.data;
    default:
      return previousState;
  }
};

export {
  fetchAllGroupChatsReducer,
};
