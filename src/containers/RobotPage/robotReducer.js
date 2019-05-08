import { INSERT_MSG } from './robotAction';

// 机器人聊天框初始化的聊天内容，和机器人的聊天消息都存在redux里
const GROUP_CHAT_ID = 'ddbffd80-3663-11e9-a580-d119b23ef62e';

const initState = {
  robotMsg: [
    // 机器人首语
    {
      message: 'hi, 我是机器人，欢迎与我聊天哦！也欢迎点击加入ghChat交流群进行交流 :grinning:',
      user: '机器人小R'
    },
    {
      message: `/group_chat/${GROUP_CHAT_ID}?name=ghChat&inviter=机器人小R`,
      user: '机器人小R'
    }
  ]
};

export default function RobotReducer(state = initState.robotMsg, action) {
  switch (action.type) {
    case INSERT_MSG:
      state.push(action.data); // 有新的聊天内容则推入robotState，数组项是个对象
      return [...state]; // 返回新的state
    default:
      return state;
  }
}
