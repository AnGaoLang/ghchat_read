import {
  SET_HOME_PAGE_LIST, UPDATE_HOME_PAGE_LIST,
  CLEAR_UNREAD, DELETE_CHAT_FROM_LIST,
  SHOW_CALL_ME_TIP,
  RELATED_CURRENT_CHAT,
  UPDATE_LIST_GROUP_NAME,
} from './homePageListAction';

// 从localstorage中获取用户信息
const userInfo = JSON.parse(localStorage.getItem('userInfo')); 
// HomePageList的reducer
const getHomePageListReducer = (previousState = [], action) => {
  switch (action.type) {
    case SET_HOME_PAGE_LIST:
    case UPDATE_HOME_PAGE_LIST:
    case CLEAR_UNREAD:
    case DELETE_CHAT_FROM_LIST:
    case SHOW_CALL_ME_TIP:
    case UPDATE_LIST_GROUP_NAME:
      // 如果localStorage用户信息存在,则在localstorage中存入新的homePageList
      if (userInfo) {
        localStorage.setItem(`homePageList-${userInfo.user_id}`, JSON.stringify(action.data));
      }
      // 返回新的state.HomePageList
      return [...action.data];
    default:
      return previousState;
  }
};

// relatedCurrentChat 的reducer
const relatedCurrentChatReducer = (previousState = true, action) => {
  switch (action.type) {
    case RELATED_CURRENT_CHAT:
      return action.data;
    default:
      return previousState;
  }
};

export {
  getHomePageListReducer,
  relatedCurrentChatReducer
};
