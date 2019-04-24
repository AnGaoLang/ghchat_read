/* eslint-disable react/destructuring-assignment */
import React, { Component } from 'react';
import Request from '../../utils/request';
import Modal from '../../components/Modal';
import notification from '../../components/Notification';
import SignInSignUp from '../../components/SignInSignUp';
import './index.scss';

class LogIn extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      password: '',
      modal: {
        visible: false,
      }
    };
  }

  async login() {
    const { name, password } = this.state;
    if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(name)) {
      notification('用户名只能由汉字，数字，字母，下划线组成', 'warn'); // notification组件
      return;
    }
    if (!/^[A-Za-z0-9]+$/.test(password)) {
      notification('密码只能由字母数字组成', 'warn');
      return;
    }
    try {
      const res = await Request.axios('post', '/api/v1/login', { name, password });
      if (res && res.success) {
        localStorage.setItem('userInfo', JSON.stringify(res.userInfo));
        // 改变state，显示弹窗
        this.setState({
          modal: {
            visible: true,
          }
        });
      } else {
        notification(res.message, 'error');
      }
    } catch (error) {
      notification(error, 'error');
    }
  }

  // 传入子组件SignInSignUp的函数，
  // 更新当前组件输入的用户名和密码，并调用当前组件的登陆接口
  setValue = (value) => { 
    const { name, password } = value;
    this.setState({
      name,
      password
    }, async () => {
      await this.login(); // 登陆
    });
  }

  // 弹出框确认登陆，取出被拦截的地址，如果存在，则直接跳转到被拦截的地址
  confirm = () => {
    this.setState({
      modal: {
        visible: true,
      }
    });
    window.location.reload();
    const originalLink = sessionStorage.getItem('originalLink');
    if (originalLink) {
      sessionStorage.removeItem('originalLink');
      window.location.href = originalLink;
      return;
    }
    // this.props.history({path: '/'});
    window.location.href = '/';
  };


  render() {
    const { visible } = this.state.modal;
    return (
      <div className="login">
        {/* isLogin只有键没有值，将自动被赋值为true */}
        <SignInSignUp setValue={this.setValue} isLogin/>

        {/* 模态框 visible控制显示、隐藏，confirm确认的处理函数，hasConfirm是否显示确认键*/}
        <Modal
          title="提示"
          visible={visible}
          confirm={this.confirm}
          hasConfirm
        >
          <p className="content">
            {'您已登录成功'}
          </p>
        </Modal>
      </div>
    );
  }
}

export default LogIn;
