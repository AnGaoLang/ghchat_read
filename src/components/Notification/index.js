import React from 'react';
import Notification from 'rc-notification';
import './style.scss';

// rc-notification第三方提示框组件
function addIcon(msg, type) {
  let content; // notification的图标样式
  // 依据不同type返回不同提示框的具体内容
  if (type === 'success') {
    content = (
      <div className="all-icon">
        <svg className="icon " aria-hidden="true"><use xlinkHref="#icon-success1" /></svg>
        {' '}
        { msg }
      </div>
    );
  } else if (type === 'warn') {
    content = (
      <div className="all-icon">
        <svg className="icon" aria-hidden="true"><use xlinkHref="#icon-warn1" /></svg>
        {' '}
        { msg }
      </div>
    );
  } else if (type === 'error') {
    content = (
      <div className="all-icon">
        <svg className="icon" aria-hidden="true"><use xlinkHref="#icon-error1" /></svg>
        {' '}
        { msg }
      </div>
    );
  }
  return content;
}

export default function notification(msg, type, duration) {
  const content = addIcon(msg, type);
  Notification.newInstance({}, (notification) => {
    notification.notice({
      content,
      duration
    });
  });
}
