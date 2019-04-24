import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import loadable from '@loadable/component';
import Tabs from '../components/Tabs';

function MainView(props) { // 左侧的视图
  const { pathname } = props.location;
  // 拦截未登陆用户，重定向到登陆页面
  if (pathname !== '/login' && pathname !== '/register' && !localStorage.getItem('userInfo')) {
    sessionStorage.setItem('originalLink', window.location.href); // 存储页面当前地址，等登陆成功可以直接倒像缓存的地址
    props.history.push('/login');
  }
  // 包裹层的classname
  let MainViewClassName; // 给
  if (pathname === '/' || pathname === '/setting') {
    MainViewClassName = 'layout-left';
  } else {
    MainViewClassName = 'layout-left-mobile'; // 移动设备下。路由非'/'或者'/setting'，会隐藏左侧
  }
  return (
    <div className={MainViewClassName}>
      <Tabs />
      <Route path={['/', '/robot_chat', '/group_chat/:to_group_id', '/private_chat/:user_id']} exact component={loadable(() => import('../containers/HomePageList'))} />
      <Route path="/setting" exact component={loadable(() => import('../containers/SettingPage'))} />
    </div>
  );
}

function RightView(props) { // 右侧的视图
  const { pathname } = props.location;
  let RightViewClassName;
  if (pathname === '/' || pathname === '/setting') {
    RightViewClassName = 'layout-right-mobile';
  } else {
    RightViewClassName = 'layout-right';
  }
  return (
    <div className={RightViewClassName}>
      <Route path="/robot_chat" component={loadable(() => import('../containers/RobotPage'))} />
      <Route path="/group_chat/:to_group_id" component={loadable(() => import('../containers/GroupChatPage'))} />
      <Route path="/private_chat/:user_id" component={loadable(() => import('../containers/PrivateChatPage'))} />
      {['/', '/setting'].map((path, index) => <Route path={path} exact component={loadable(() => import('../containers/WelcomePage'))} key={index} />)}
    </div>
  );
}

export default function getRouter() {
  return (
    <Router>
      <div className="layout-wrapper">
        <Route path="/register" component={loadable(() => import('../containers/RegisterPage'))} />
        <Route path="/login" component={loadable(() => import('../containers/LogInPage'))} />
        {/* 以下路由都匹配 MainView RightView包装组件*/}
        <Route path={['/', '/robot_chat', '/group_chat/:to_group_id', '/private_chat/:user_id', '/setting']} exact component={MainView} />
        <Route path={['/', '/robot_chat', '/group_chat/:to_group_id', '/private_chat/:user_id', '/setting']} exact component={RightView} />
      </div>
    </Router>
  );
}
