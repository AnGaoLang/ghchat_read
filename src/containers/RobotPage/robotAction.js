import Socket from '../../utils/socket';

export const GET_ROBOT_MSG = 'robot/GET_ROBOT_MSG';
export const INSERT_MSG = 'robot/INSERT_MSG';

// 插入用户输入信息的action
export const insertMsgAction = data => ({ 
  type: INSERT_MSG,
  data
});

const socket = new Socket();
// 获得机器人的自动回复，并插入聊天内容的action，一个异步action
export const getRobotMsgAction = async (data) => {
  let finalData = {};
  // 请求服务端的websocket响应
  const response = await socket.emit('robotChat', data);
  const { text, code, url } = response;
  // 依据不同的状态返回不同的回复语句
  if (code === 100000) {
    finalData = {
      message: text,
      user: '机器人小R'
    };
  } else if (code === 200000) {
    finalData = {
      message: text + url,
      user: '机器人小R'
    };
  } else {
    finalData = {
      message: '暂不支持此类对话',
      user: '机器人小R'
    };
  }
  return {
    type: INSERT_MSG,
    data: finalData
  };
};
