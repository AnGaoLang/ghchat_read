import { connect } from 'react-redux';
import HomePageList from '../../components/HomePageList';
import {
  showCallMeTipAction,
} from './homePageListAction';
import { initAppAction } from '../../redux/actions/initAppAction';

const mapStateToProps = (state) => {
  // 本地存有用户信息，则从本地取
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const homePageListStorage = userInfo && userInfo.user_id && JSON.parse(localStorage.getItem(`homePageList-${userInfo.user_id}`));
  console.log(state)
  return ({
    homePageList: homePageListStorage || state.homePageListState, // 聊天列表数组
    allGroupChats: state.allGroupChatsState,
    allPrivateChats: state.allPrivateChatsState,
    initializedApp: state.initAppState,
  });
};

const mapDispatchToProps = dispatch => ({
  // @我 的处理函数
  showCallMeTip(arg = {}) {
    dispatch(showCallMeTipAction({ ...arg }));
  },
  initApp(arg) {
    dispatch(initAppAction(arg));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(HomePageList);
