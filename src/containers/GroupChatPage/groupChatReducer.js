import {
  SET_ALL_GROUP_CHATS,
  ADD_GROUP_MESSAGES,
  DELETE_GROUP_CHAT,
  ADD_GROUP_INFO,
  ADD_GROUP_MESSAGE_AND_INFO,
  UPDATE_GROUP_TITLE_NOTICE,
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
      return action.data;
    default:
      return previousState;
  }
};

export {
  fetchAllGroupChatsReducer,
};
