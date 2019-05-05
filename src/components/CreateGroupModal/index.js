import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from '../Modal';
import './styles.scss';
import notification from '../Notification';

export default class GroupModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      groupName: props.defaultGroupName, // 群名。默认''。
      groupNotice: props.defaultGroupNotice, // 群公告。默认''。
    };
  }

    handleChange = (event) => {
      // 监听input的change事件。
      // 依据表单的name(groupName、groupNotice)，更新state。
      const { name, value } = event.target;
      this.setState({ [name]: value });
    }

    // 确认按钮
    _confirm = () => {
      const { groupName, groupNotice } = this.state;
      // 如果没有输入群组的名称或公告
      if (!groupName || !groupNotice) { 
        notification('你有空行没填哦', 'error');
        return;
      }
      // 群名不能用ghChat
      if (groupName === 'ghChat') {
        notification('这个群名仅供项目本身使用啦，请用别的群名', 'error');
        return;
      }
      // 确认按钮的事件触发函数
      this.props.confirm({ groupName, groupNotice });
    }

    render() {
      const {
        modalVisible, cancel, title, hasCancel, hasConfirm
      } = this.props;
      const { groupName, groupNotice } = this.state;
      return (
        <Modal
          title={title}
          visible={modalVisible}
          confirm={this._confirm}
          hasCancel={hasCancel}
          hasConfirm={hasConfirm}
          cancel={cancel}
        >
          <div className="groupModalContent">
            <p>
              <span>群名:</span>
              <input
                name="groupName"
                value={groupName}
                onChange={this.handleChange}
                type="text"
                placeholder="不超过12个字哦"
                maxLength="12" />
            </p>
            <p>
              <span>群公告:</span>
              <textarea
                name="groupNotice"
                value={groupNotice}
                onChange={this.handleChange}
                rows="3"
                type="text"
                placeholder="不超过60个字哦"
                maxLength="60" />
            </p>
          </div>
        </Modal>
      );
    }
}


GroupModal.propTypes = {
  modalVisible: PropTypes.bool,
  confirm: PropTypes.func,
  cancel: PropTypes.func,
  title: PropTypes.string,
  defaultGroupName: PropTypes.string,
  defaultGroupNotice: PropTypes.string,
};

GroupModal.defaultProps = {
  modalVisible: false,
  confirm() {},
  cancel() {},
  title: '',
  defaultGroupName: '',
  defaultGroupNotice: ''
};
