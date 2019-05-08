import { connect } from 'react-redux';
import { getRobotMsgAction, insertMsgAction } from './robotAction';
import Robot from '../../components/Robot';

const mapStateToProps = state => {
  console.log(state)
  return {
  robotState: state.robotState
}};

const mapDispatchToProps = dispatch => ({
  insertMsg(data) { // 聊天内容插入用户输入的消息
    dispatch(insertMsgAction(data));
  },
  async getRobotMsg(data) { // 获取机器人的自动回复
    dispatch(await getRobotMsgAction(data)); // 传参时使用await等待回去实参
  }
});


export default connect(mapStateToProps, mapDispatchToProps)(Robot);
