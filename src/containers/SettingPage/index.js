import {
  withRouter
} from 'react-router-dom';
import { connect } from 'react-redux';
import Setting from '../../components/Setting';
import { initAppAction } from '../../redux/actions/initAppAction';

const mapStateToProps = state => ({
  initializedApp: state.initAppState, // 获取store里的initAppState
});

const mapDispatchToProps = dispatch => ({
  initApp(arg) {
    dispatch(initAppAction(arg)); // 传入initAppAction的action分发initAppState
  }
});

// withRouter和redux的连用
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Setting));
