import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CreateGroupModal from '../CreateGroupModal';
import './style.scss';
import SearchBox from '../SearchBox';

export default class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false, // 是否显模态框
    };
    this._userInfo = JSON.parse(localStorage.getItem('userInfo')); // 获取用户信息
  }

  confirm = ({ groupName, groupNotice }) => {
    this.setState({
      modalVisible: false
    });
    this.createGroup({ groupName, groupNotice });
  };

  createGroup = ({ groupName, groupNotice }) => {
    const { name, user_id } = this._userInfo;
    const data = {
      name: groupName,
      group_notice: groupNotice,
      creator_id: user_id,
      create_time: Date.parse(new Date()) / 1000
    };
    window.socket.emit('createGroup', data, (res) => {
      console.log(res);
      const {
        addGroupMessageAndInfo, updateHomePageList, homePageList, allGroupChats,
      } = this.props;
      const members = [{
        user_id,
        name,
        status: 1
      }];
      // 在新建的群组内显示创建群成功的消息
      const groupInfo = Object.assign({ members }, res); // 合并members数组与res为一个新对象{...,member: [],...}
      console.log(groupInfo); 
      res.message = `${name}: 创建群成功！`;
      res.time = res.create_time;
      res.from_user = res.creator_id;
      updateHomePageList({ data: res, homePageList });
      addGroupMessageAndInfo({
        allGroupChats, message: { ...res, name }, groupId: res.to_group_id, groupInfo
      });
      this.props.history.push(`/group_chat/${res.to_group_id}?name=${res.name}`);
    });
  }

  // 开打模态框
  openModal = () => {
    this.setState({
      modalVisible: true
    });
  }

   // 关闭模态框
  cancel = () => {
    this.setState({
      modalVisible: false
    });
  }

  // 打开github地址
  _openRepository = () => {
    window.open('https://github.com/aermin/react-chat');
  }

  render() {
    const {
      modalVisible
    } = this.state;
    const { isSearching, searchFieldChange } = this.props;
    return (
      <div className="header-wrapper">

        {/* 右边的github图标 */}
        <svg onClick={this._openRepository} className="icon githubIcon" aria-hidden="true">
          <use xlinkHref="#icon-github" />
        </svg>

        {/* 搜索框 */}
        <SearchBox
          searchFieldChange={searchFieldChange}
          isSearching={isSearching}
        />
        
        {/* 创建群组 */}
        <span className="add" onClick={this.openModal}>
          <svg className="icon" aria-hidden="true"><use xlinkHref="#icon-add" /></svg>
        </span>
        
        {/* 创建群组的弹框 */}
        <CreateGroupModal
          title="创建群组"
          modalVisible={modalVisible}
          confirm={args => this.confirm(args)}
          hasCancel
          hasConfirm
          cancel={this.cancel}
         />
      </div>
    );
  }
}

Header.propTypes = {
  updateHomePageList: PropTypes.func,
  homePageList: PropTypes.array,
  allGroupChats: PropTypes.object,
  searchFieldChange: PropTypes.func,
  isSearching: PropTypes.bool,
  addGroupMessageAndInfo: PropTypes.func,
};


Header.defaultProps = {
  updateHomePageList: undefined,
  homePageList: [],
  allGroupChats: new Map(),
  searchFieldChange: undefined,
  isSearching: false,
  addGroupMessageAndInfo() {}
};
