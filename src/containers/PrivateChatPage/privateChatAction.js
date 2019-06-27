const SET_ALL_PRIVATE_CHATS = 'SET_ALL_PRIVATE_CHATS';
const ADD_PRIVATE_CHAT_MESSAGES = 'ADD_PRIVATE_CHAT_MESSAGES';
const ADD_PRIVATE_INFO = 'ADD_PRIVATE_INFO';
const ADD_PRIVATE_CHAT_MESSAGE_AND_INFO = 'ADD_PRIVATE_CHAT_MESSAGE_AND_INFO';

const setAllPrivateChatsAction = ({ data = new Map() }) => ({
  type: SET_ALL_PRIVATE_CHATS,
  data
});

// 更新私人聊天信息
const addPrivateChatMessagesAction = ({
  allPrivateChats, messages, message, chatId, inLazyLoading
}) => {
  const allPrivateChatsCopy = new Map(allPrivateChats); // 复制allPrivateChats
  const goalPrivateChat = allPrivateChatsCopy.get(chatId); // 依据chatId获取私人聊天
  const originMessages = goalPrivateChat && goalPrivateChat.messages || [];// 获取私人的聊天消息
  const newMessages = messages || [message]; // 新传入的消息，要么messages数组，要么单条 message
  if (goalPrivateChat) { // goalPrivateChat存在
    // 消息是否为懒加载，为真则将新加载的消息插入到原消息数组之前，反之则插入到原消息数组之后
    const finalMessages = inLazyLoading ? [...newMessages, ...originMessages] : [...originMessages, ...newMessages];
    allPrivateChatsCopy.get(chatId).messages = finalMessages; // 更新allPrivateChatsCopy里的消息数组
  } else {// goalPrivateChat不存在，表明当前私聊没有消息、直接将新消息插入
    allPrivateChatsCopy.set(chatId, { messages: newMessages });
  }
  return { type: ADD_PRIVATE_CHAT_MESSAGES, data: allPrivateChatsCopy }; // 返回新的allPrivateChatsCopy
};

const addPrivateChatInfoAction = ({
  allPrivateChats, chatId, userInfo,
}) => {
  if (!userInfo.user_id) throw new Error('not exist userInfo.user_id!');
  const allPrivateChatsCopy = new Map(allPrivateChats);
  const goalPrivateChat = allPrivateChatsCopy.get(chatId);
  if (goalPrivateChat) {
    allPrivateChatsCopy.get(chatId).userInfo = userInfo;
  } else {
    allPrivateChatsCopy.set(chatId, { userInfo });
  }
  return { type: ADD_PRIVATE_INFO, data: allPrivateChatsCopy };
};

const addPrivateChatMessageAndInfoAction = ({
  allPrivateChats, messages, message, chatId, userInfo,
}) => {
  const res = addPrivateChatMessagesAction({
    allPrivateChats, messages, message, chatId
  });
  const { data } = addPrivateChatInfoAction({
    allPrivateChats: res.data, chatId, userInfo,
  });
  return { type: ADD_PRIVATE_CHAT_MESSAGE_AND_INFO, data };
};


export {
  SET_ALL_PRIVATE_CHATS,
  ADD_PRIVATE_CHAT_MESSAGES,
  ADD_PRIVATE_INFO,
  ADD_PRIVATE_CHAT_MESSAGE_AND_INFO,
  setAllPrivateChatsAction,
  addPrivateChatMessagesAction,
  addPrivateChatInfoAction,
  addPrivateChatMessageAndInfoAction,
};
