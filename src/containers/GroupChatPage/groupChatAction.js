const SET_ALL_GROUP_CHATS = 'SET_ALL_GROUP_CHATS';
const ADD_GROUP_MESSAGES = 'ADD_GROUP_MESSAGES';
const ADD_GROUP_INFO = 'ADD_GROUP_INFO';
const DELETE_GROUP_CHAT = 'DELETE_GROUP_CHAT';
const ADD_GROUP_MESSAGE_AND_INFO = 'ADD_GROUP_MESSAGE_AND_INFO';
const UPDATE_GROUP_TITLE_NOTICE = 'UPDATE_GROUP_TITLE_NOTICE';

// 设置全部群组聊天的action，包括 群组本身的信息，以及所有的消息列表
const setAllGroupChatsAction = ({ data = new Map() }) => ({
  type: SET_ALL_GROUP_CHATS,
  data
});

const addGroupMessagesAction = ({
  allGroupChats, messages, message, groupId, inLazyLoading = false
}) => {
  const allGroupChatsCopy = new Map(allGroupChats);
  const goalGroupChat = allGroupChatsCopy.get(groupId);
  const originMessages = goalGroupChat && goalGroupChat.messages || [];
  const newMessages = messages || [message];
  if (goalGroupChat) {
    const finalMessages = inLazyLoading ? [...newMessages, ...originMessages] : [...originMessages, ...newMessages];
    allGroupChatsCopy.get(groupId).messages = finalMessages;
  } else {
    allGroupChatsCopy.set(groupId, { messages: newMessages });
  }
  return { type: ADD_GROUP_MESSAGES, data: allGroupChatsCopy };
};

const addGroupInfoAction = ({
  allGroupChats, member,
  members, groupId, groupInfo,
}) => {
  const membersArg = members || [member];
  const allGroupChatsCopy = new Map(allGroupChats);
  const goalGroupChat = allGroupChatsCopy.get(groupId);
  const originGroupInfo = goalGroupChat && goalGroupChat.groupInfo || {};
  const originMembers = originGroupInfo && originGroupInfo.members || [];
  const newGroupMembers = originMembers.filter(m => m.user_id === (member && member.user_id)).length === 0
    ? [...originMembers, ...membersArg] : originMembers;
  const newGroupInfo = groupInfo || { ...originGroupInfo, members: newGroupMembers };
  if (goalGroupChat) {
    allGroupChatsCopy.get(groupId).groupInfo = newGroupInfo;
  } else {
    allGroupChatsCopy.set(groupId, { groupInfo: newGroupInfo });
  }
  return { type: ADD_GROUP_INFO, data: allGroupChatsCopy };
};

const addGroupMessageAndInfoAction = ({
  allGroupChats, groupId, messages, message, member,
  members, groupInfo
}) => {
  const res = addGroupMessagesAction({
    allGroupChats, groupId, messages, message
  });
  const { data } = addGroupInfoAction({
    allGroupChats: res.data,
    groupId,
    member,
    members,
    groupInfo
  });
  return { type: ADD_GROUP_MESSAGE_AND_INFO, data };
};

// 更新群公告的action
const updateGroupTitleNoticeAction = ({
  allGroupChats, // 全部群组信息
  groupNotice, // 群组公告
  groupName, // 群组名
  groupId // 群组id
}) => {
  const allGroupChatsCopy = new Map(allGroupChats); // 以allGroupChats为拷贝
  const goalGroupChat = allGroupChatsCopy.get(groupId); // 以群组id获取相应群组的信息包括聊天消息
  if (!goalGroupChat || !goalGroupChat.groupInfo) console.error('不存在此群的信息'); // 如果不存在，直接return
  goalGroupChat.groupInfo = { ...goalGroupChat.groupInfo, group_notice: groupNotice, name: groupName }; // 更新群组相关信息，返还新的allGroupChats Map
  return { type: UPDATE_GROUP_TITLE_NOTICE, data: allGroupChatsCopy };
};

const deleteGroupChatAction = ({
  allGroupChats, groupId
}) => {
  const allGroupChatsCopy = new Map(allGroupChats);
  const goalGroupChat = allGroupChatsCopy.get(groupId);
  if (goalGroupChat) {
    allGroupChatsCopy.delete(groupId);
  }
  return { type: DELETE_GROUP_CHAT, data: allGroupChatsCopy };
};

export {
  SET_ALL_GROUP_CHATS,
  ADD_GROUP_MESSAGES,
  DELETE_GROUP_CHAT,
  ADD_GROUP_INFO,
  ADD_GROUP_MESSAGE_AND_INFO,
  UPDATE_GROUP_TITLE_NOTICE,
  setAllGroupChatsAction,
  addGroupMessagesAction,
  deleteGroupChatAction,
  addGroupInfoAction,
  addGroupMessageAndInfoAction,
  updateGroupTitleNoticeAction,
};
