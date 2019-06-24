import { List } from 'immutable';

const UPDATE_HOME_PAGE_LIST = 'UPDATE_HOME_PAGE_LIST';
const CLEAR_UNREAD = 'CLEAR_UNREAD';
const DELETE_CHAT_FROM_LIST = 'DELETE_CHAT_FROM_LIST';
const SET_HOME_PAGE_LIST = 'SET_HOME_PAGE_LIST';
const SHOW_CALL_ME_TIP = 'SHOW_CALL_ME_TIP';
const RELATED_CURRENT_CHAT = 'RELATED_CURRENT_CHAT';
const UPDATE_LIST_GROUP_NAME = 'UPDATE_LIST_GROUP_NAME';

// TODO: 重构和代码注释
const updateHomePageListAction = ({
  homePageList, data, myUserId, increaseUnread = 0, showCallMeTip = false
}) => {
  const homePageListCopy = [...List(homePageList)];
  const dataCopy = { ...data, showCallMeTip };
  let chatFromId;
  if (dataCopy && dataCopy.to_user) {
    chatFromId = dataCopy.from_user === myUserId ? dataCopy.to_user : dataCopy.from_user;
    dataCopy.user_id = chatFromId;
  } else if (dataCopy && dataCopy.to_group_id) {
    chatFromId = dataCopy.to_group_id;
  }
  const chatExist = homePageListCopy.find(e => e.user_id === chatFromId || e.to_group_id === chatFromId);
  if (chatExist) {
    const length = homePageListCopy.length;
    for (let i = 0; i < length; i++) {
      const { user_id, to_group_id, unread = 0 } = homePageListCopy[i];
      if (user_id === chatFromId || to_group_id === chatFromId) {
        const updatedUnread = unread + increaseUnread;
        const { message, time } = dataCopy;
        homePageListCopy[i] = Object.assign(homePageListCopy[i], {
          message, time, unread: updatedUnread, showCallMeTip
        });
        break;
      }
    }
  } else {
    dataCopy.unread = increaseUnread;
    homePageListCopy.push(dataCopy);
  }
  return {
    type: UPDATE_HOME_PAGE_LIST,
    data: homePageListCopy
  };
};

// 更新群名的action
const updateListGroupNameAction = ({
  homePageList, // 聊天列表
  name, // 聊天列表里的群组名
  to_group_id // 群组id
}) => {
  const homePageListCopy = [...List(homePageList)]; // 拷贝一个homePageList
  const goal = homePageListCopy.find(e => e.to_group_id === to_group_id); // 依据群组id找到相应的群组项
  goal.name = name; // 更改名称
  // 返还新的homePageListCopy
  return {
    type: UPDATE_LIST_GROUP_NAME,
    data: homePageListCopy
  };
};

// homePageList：聊天框列表；showCallMeTip：是否有人@的布尔值；chatFromId群组的id
const showCallMeTipAction = ({ homePageList, showCallMeTip, chatFromId }) => { // 函数参数的解构赋值
  const homePageListCopy = [...List(homePageList)]; // 深拷贝homePageList
  const length = homePageListCopy.length;
  for (let i = 0; i < length; i++) {
    const { to_group_id } = homePageListCopy[i];
    // 在目标id的群组里插入showCallMeTip属性
    if (to_group_id === chatFromId) {
      homePageListCopy[i].showCallMeTip = showCallMeTip;
      break;
    }
  }
  return {
    type: SHOW_CALL_ME_TIP,
    data: homePageListCopy // 返回新的homePageList
  };
};

const deleteHomePageListAction = ({
  homePageList, chatId
}) => {
  const homePageListCopy = [...List(homePageList)];
  const length = homePageListCopy.length;
  for (let i = 0; i < length; i++) {
    const { to_group_id, user_id } = homePageListCopy[i];
    const id = to_group_id || user_id;
    if (chatId === id) {
      homePageListCopy.splice(i, 1);
      break;
    }
  }
  return {
    type: DELETE_CHAT_FROM_LIST,
    data: homePageListCopy
  };
};

// 依据chatFromId比对user_id、to_group_id，重置相应聊天框的所有未读消息为0
const clearUnreadAction = ({ chatFromId, homePageList }) => {
  const homePageListCopy = [...List(homePageList)];
  const length = homePageListCopy.length;
  for (let i = 0; i < length; i++) {
    const { user_id, to_group_id } = homePageListCopy[i];
    if ((user_id && user_id.toString()) === (chatFromId && chatFromId.toString())
        || to_group_id === chatFromId) {
      homePageListCopy[i].unread = 0;
      break;
    }
  }
  return {
    type: CLEAR_UNREAD,
    data: homePageListCopy
  };
};

const setHomePageListAction = (homePageList = []) => ({
  type: SET_HOME_PAGE_LIST,
  data: homePageList
});

const relatedCurrentChatAction = isRelatedCurrentChat => ({
  type: RELATED_CURRENT_CHAT,
  data: isRelatedCurrentChat
});

export {
  UPDATE_HOME_PAGE_LIST,
  CLEAR_UNREAD,
  DELETE_CHAT_FROM_LIST,
  SET_HOME_PAGE_LIST,
  SHOW_CALL_ME_TIP,
  RELATED_CURRENT_CHAT,
  UPDATE_LIST_GROUP_NAME,
  updateHomePageListAction,
  clearUnreadAction,
  deleteHomePageListAction,
  setHomePageListAction,
  showCallMeTipAction,
  relatedCurrentChatAction,
  updateListGroupNameAction
};
