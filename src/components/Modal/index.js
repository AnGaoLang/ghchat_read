import React from 'react';
import PropTypes from 'prop-types';
import './style.scss';
import ModalBase from '../ModalBase';


confirmCancelRender.propTypes = {
  hasCancel: PropTypes.bool,
  hasConfirm: PropTypes.bool,
  cancel: PropTypes.func, // 点击遮罩取消Modal的前提是有传cancel方法
  confirm: PropTypes.func,
};

confirmCancelRender.defaultProps = {
  hasCancel: false, // 是否有取消键
  hasConfirm: false, // 是否有取消键
  cancel: undefined, // 取消键的处理函数
  confirm: undefined, // 确认键的处理函数
};

// 弹出框下面的按钮
function confirmCancelRender(props) {
  const {
    hasCancel, hasConfirm, confirm, cancel
  } = props;
  // 如果有取消键和确认键，则都显示
  if (hasCancel && hasConfirm) {
    return (
      <div className="twoButton">
        <p onClick={cancel}>取消</p>
        <p onClick={confirm}>确定</p>
      </div>
    );
  };
  //  如果取消键和确认键只有其中一个，则显示其中一个
  if (hasConfirm || hasCancel) {
    return (
      <div className="oneButton">
        {hasCancel && <p onClick={cancel}>取消</p>}
        {hasConfirm && <p onClick={confirm}>确定</p>}
      </div>
    );
  }
  return null;
}


dialogRender.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
};

dialogRender.defaultProps = {
  title: '', // 弹出框的标题
  children: undefined, // 弹出框的主体，作为插槽，props.children插入
};

function dialogRender(props) {
  const { title, children } = props;
  return (
    <div className="dialogRender">
      <h3 className="title">{title}</h3>
      {children}
      {confirmCancelRender({ ...props })}
    </div>
  );
}

const ModalDialogRender = ModalBase(dialogRender); // 传入弹出框基本组件
// TODO: （refactor）take thinner component
export default function Modal(props) {
  return (
    <ModalDialogRender {...props} />
  );
}
