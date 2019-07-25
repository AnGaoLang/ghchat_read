const SET_ALL_GROUP_CHATS = 'SET_ALL_GROUP_CHATS';
const ADD_GROUP_MESSAGES = 'ADD_GROUP_MESSAGES';
const ADD_GROUP_INFO = 'ADD_GROUP_INFO';
const DELETE_GROUP_CHAT = 'DELETE_GROUP_CHAT';
const ADD_GROUP_MESSAGE_AND_INFO = 'ADD_GROUP_MESSAGE_AND_INFO';
const UPDATE_GROUP_TITLE_NOTICE = 'UPDATE_GROUP_TITLE_NOTICE';

// 设置全部群组聊天的action，包括 群组本身的信息和聊天消息
const setAllGroupChatsAction = ({ data = new Map() }) => ({
  type: SET_ALL_GROUP_CHATS,
  data
});

// 新增群组聊天信息
const addGroupMessagesAction = ({
  allGroupChats, messages, message, groupId, inLazyLoading = false
}) => {
  const allGroupChatsCopy = new Map(allGroupChats); // 复制当前allGroupChats
  const goalGroupChat = allGroupChatsCopy.get(groupId); // 依据群组id获取目标群组
  const originMessages = goalGroupChat && goalGroupChat.messages || []; // 获取群组的聊天消息
  const newMessages = messages || [message]; // 新插入的消息，要么是 messages 数组，或单条消息message
  if (goalGroupChat) { // goalGroupChat存在
    // 消息是否为懒加载，为真则将新加载的消息插入到原消息数组之前，反之则插入到原消息数组之后
    const finalMessages = inLazyLoading ? [...newMessages, ...originMessages] : [...originMessages, ...newMessages];
    allGroupChatsCopy.get(groupId).messages = finalMessages; // 更新allGroupChatsCopy里的消息数组
  } else {// 若goalGroupChat不存在，表明当前群组没有消息、直接将新消息插入
    allGroupChatsCopy.set(groupId, { messages: newMessages });
  }
  return { type: ADD_GROUP_MESSAGES, data: allGroupChatsCopy }; // 返回新的allGroupChats
};

// 添加群组自身信息
const addGroupInfoAction = ({
  allGroupChats, member,
  members, groupId, groupInfo,
}) => {
  const membersArg = members || [member];
  const allGroupChatsCopy = new Map(allGroupChats); // 复制当前allGroupChats
  const goalGroupChat = allGroupChatsCopy.get(groupId); // 依据当前群组id获取群组信息及聊天消息
  const originGroupInfo = goalGroupChat && goalGroupChat.groupInfo || {}; // 获取群组信息，没有则返回{}
  const originMembers = originGroupInfo && originGroupInfo.members || []; // 获取群组成员，没有则返回{}
  // 依据传入的 member 判断是否为当前群组的成员，若是不在当前群组，则将加进当前群组，若在，则直接返回当前群组的成员
  const newGroupMembers = originMembers.filter(m => m.user_id === (member && member.user_id)).length === 0 // 筛选不出内容，表示不存在
    ? [...originMembers, ...membersArg] : originMembers;
  // 若传入了groupInfo，则直接使用传入的新的群组信息，否则更新群组的成员
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
