import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  withRouter,
} from 'react-router-dom';
// import axios from 'axios';
import UserAvatar from '../UserAvatar';
import './styles.scss';
import Button from '../Button';
import Modal from '../Modal';
import InitApp from '../../modules/InitApp';

class Setting extends Component {
  constructor(props) {
    super(props);
    this._userInfo = JSON.parse(localStorage.getItem('userInfo'));
    this.state = {
      visible: false, // 控制modal的显示
      // githubStars: '--',
    };
  }

  componentWillMount() {
     // 获取并判断store里的initAppState
    if (!this.props.initializedApp) {
      this._InitApp = new InitApp({ history: this.props.history });
      this._InitApp.init();
      this.props.initApp(true); // 改变store里的initAppState为true
    }
  }

   _showModal = () => { // 显示modal
     this.setState({ visible: true });
   }

   _hideModal = () => { // 隐藏modal
     this.setState({ visible: false });
   }

   logout = () => { // 
     window.socket.disconnect();
     localStorage.removeItem('userInfo'); // 清空localstorage里的登陆相关信息
     this.props.initApp(false);
     this.props.history.push('/login'); // 回到登陆页面
   }

   //  componentDidMount() {
   //    axios.get('https://api.github.com/repos/aermin/react-chat').then((res) => {
   //      this.setState({ githubStars: res.data.stargazers_count });
   //    });
   //  }

  _openRepository = () => {
    window.open('https://github.com/aermin/react-chat'); // 打开github库
  }

  render() {
    // 从githun内拿到缓存的用户信息
    const {
      name, avatar, github, intro, location, website, company
    } = this._userInfo;
    // github标志
    const githubStarRender = (
      <div className="githubStarRender" onClick={this._openRepository}>
        <svg className="icon githubIcon" aria-hidden="true">
          <use xlinkHref="#icon-github-copy" />
        </svg>
        <span className="starTitle">
          源码 & star
        </span>
      </div>
    );

    return (
      <div className="setting">
        {/* 显示modal */}
        {/* 退出登录 */}
        {/* 显示取消键 */}
        {/* 显示确认键 */}
        {/* 取消则关闭modal，但不登出 */}
        <Modal
          title="确定退出？"
          visible={this.state.visible}
          confirm={this.logout}
          hasCancel
          hasConfirm
          cancel={this._hideModal}
         />
        {githubStarRender}
        <UserAvatar name={name} src={avatar} size="60" />
        <p className="name">{name}</p>
        {/* 展示个人相关信息 */}
        <div className="userInfo">
          {intro && <p>{`介绍: ${intro}`}</p>}
          {location && <p>{`来自: ${location}`}</p>}
          {company && <p>{`公司: ${company}`}</p>}
          {website && <p>{`网站: ${website}`}</p>}
          {github && <p>{`github: ${github}`}</p>}
        </div>

        {/* clickFn为click事件监听函数，value为input的value */}
        <Button clickFn={this._showModal} value="退出登录" />
      </div>
    );
  }
}


Setting.propTypes = {
  initializedApp: PropTypes.bool,
  initApp: PropTypes.func,
};


Setting.defaultProps = {
  initializedApp: false,
  initApp() {},
};

export default withRouter(Setting);
