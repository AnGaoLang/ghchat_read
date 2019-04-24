import React, { Component } from 'react';
import './index.scss';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Request from '../../utils/request'; // ajax请求
import Spinner from '../Spinner'; // loading加载页面
import UserAvatar from '../UserAvatar'; // 随用户输入变化颜色的圆形色块

export default class SignInSignUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      password: '',
      showSpinner: true
    };
  }

  async loginGithub() { // github授权登陆
    const href = window.location.href;
    if (/\/login\?code/.test(href)) {
      const code = href.split('?code=')[1];
      const response = await Request.axios('post', '/api/v1/github_oauth', { code, clientId: this.clientId });
      localStorage.setItem('userInfo', JSON.stringify(response));
      window.location.reload(); // 刷新页面
      const originalLink = sessionStorage.getItem('originalLink');
      if (originalLink) {
        sessionStorage.removeItem('originalLink');
        window.location.href = originalLink;
        return;
      }
      window.location.href = '/'; // 跳转
    }
  }

  componentDidMount() {
    // 页面挂载完成后，默认隐藏加载层，如果用github授权登陆，则登陆成功后在隐藏加载层
    this.loginGithub().then(() => {
      this.setState({ showSpinner: false });
    });
  }

  handleClick = () => {
    this.props.setValue(this.state); // 父组件传进来的setValue函数，分为登陆和注册
  }

  handleChange = (event) => {
    const { target } = event; // 解构并获取event对象上的target属性
    // [target.name]对应的input的name属性，即'name'/'password',也对应上面的state
    this.setState({ [target.name]: target.value });
  }

  get clientId() { // 拦截clientId的取行为
    return '8c694af835d62f8fd490';
  }

  render() {
    const { isLogin } = this.props; // 获取props上的isLogin属性,true
    const { name, password } = this.state;
    const loginClass = isLogin ? 'active' : 'inactive';
    const registerClass = isLogin ? 'inactive' : 'active';
    const linkUrl = isLogin ? '/register' : '/login';
    const buttonName = isLogin ? '登录' : '注册';
    const OAuthHref = `https://github.com/login/oauth/authorize?client_id=${this.clientId}`;
    return (
      <div className="formContent fadeInDown">
        {/* Spinner加载层的显示隐藏 */}
        {this.state.showSpinner && <Spinner />}
        <div className="ghChatLogo">
          <img src="https://cdn.aermin.top/ghChatIcon.png" alt="ghChatLogo" />
        </div>

        {/* 跳转到登陆页面 */}
        <Link to={linkUrl}>
          <span className={loginClass}>登录</span>
        </Link>
        {/* 跳转到注册页面 */}
        <Link to={linkUrl}>
          <span className={registerClass}>注册</span>
        </Link>
        {/* 随输入用户名变化而变化的色块 */}
        <div className="UserAvatar">
          <UserAvatar name={name || 'Ÿ'} size="100" isGray={true}/>
        </div>
        {/* 用户名input */}
        <div className="center">
          <input
            type="text"
            name="name"
            value={name}
            onChange={this.handleChange}
            placeholder="用户名"
              />
        </div>
        {/* 密码input */}
        <div className="center">
          <input
            type="password"
            name="password"
            value={password}
            onChange={this.handleChange}
            placeholder="密码"
              />
        </div>
        {/* 底部的登陆/注册按钮 */}
        <div className="center">
          <input
            type="button"
            onClick={this.handleClick}

            value={buttonName}
              />
        </div>
        {/* 授权github登陆 */}
        <div className="center">
          <a className="githubOAuth" href={OAuthHref}>
            <svg className="icon githubIcon" aria-hidden="true">
              <use xlinkHref="#icon-github" />
            </svg>
          </a>
        </div>


      </div>
    );
  }
}


SignInSignUp.propTypes = {
  setValue: PropTypes.func,
  isLogin: PropTypes.bool
};


SignInSignUp.defaultProps = {
  setValue() {},
  isLogin: false,
};
