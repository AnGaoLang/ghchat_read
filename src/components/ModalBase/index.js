import React from 'react';
import './styles.scss';
import classnames from 'classnames';

// 模态框组件的基础高阶组件
// 定义了：1.整个模态框的包裹层;2.遮罩层;3.弹框的主题和右上角的关闭按钮
function ModalBase(Comp) { // 第一次调用，传入组件，返回一个function的render。
  return (props) => { // 通过闭包，在第二次调用中缓存了第一次调用传入的组件Comp，并接受props作为参数传入。
    const { visible = false, cancel, modalWrapperClassName } = props;
    return (
      <div>
        {visible && (
        <div className="modal">
          <div onClick={cancel} className="mask" />
          <div className={classnames('modalWrapper', modalWrapperClassName)}>
            {cancel && <span onClick={cancel} className="xIcon">x</span>}
            <Comp {...props} />
          </div>
        </div>
        )}
      </div>
    );
  };
}

export default ModalBase;
