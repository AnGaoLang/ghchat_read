import React, { Component } from 'react';
import {
  withRouter,
} from 'react-router-dom';
import Fuse from 'fuse.js';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import './styles.scss';
import notification from '../Notification';
import Modal from '../Modal';
import SearchBox from '../SearchBox';
import ListItems from '../ListItems';


class InviteModal extends Component {
  constructor(props) {
    super(props);
    console.log(props)
    this.state = {
      isSearching: false, // 是否搜索
      contactedItems: [], // 模糊搜索后的结果 
    };
  }

  // 点击链接分享的触发函数，新建一个input函数，进行复制操作
  _copyInviteLink = () => {
    const dummy = document.createElement('input');
    const text = `${window.location.origin}${window.location.pathname}`; // 获取当前页面的链接地址，去除后缀参数
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select(); // 选中input内的文本
    document.execCommand('copy'); // 进行复制操作
    document.body.removeChild(dummy);
    notification('你已复制了邀请链接，可以发给应用外的人啦', 'success');
  }

  // 搜索框输入的处理函数，传入的是输入的文本
  searchFieldChange(field) {
    this._filedStr = field.toString();
    // 输入的内容长度大于1
    if (this._filedStr.length > 0) {
      const { homePageList } = this.props;
      const homePageListCopy = [...List(homePageList)];
      const fuse = new Fuse(homePageListCopy, this.filterOptions); // 从homePageList里进行模糊搜索
      const contactedItems = fuse.search(this._filedStr); // 模糊搜索的结果
      this.setState({ isSearching: true, contactedItems }); // 更新contactedItems为糊搜索的结果,搜索框内的内容为输入的内容
    } else {
      this.setState({ isSearching: false }); // 清空搜索框
    }
  }

  // fuse.js模糊搜索的条件
  get filterOptions() {
    const options = {
      shouldSort: true,
      threshold: 0.3,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: [
        'name',
      ]
    };
    return options;
  }

  // 点击相关联系人的 ListItems 聊天列表，进行邀请
  _clickItemHandle = () => {
    const { clickInviteModalItem, homePageList, chatId } = this.props;
    clickInviteModalItem({ chatId, homePageList });
  }

  render() {
    const {
      title, modalVisible, cancel, allGroupChats, homePageList
    } = this.props;
    const { isSearching, contactedItems } = this.state;
    return (
      // 显示弹出框
      <Modal
        title={title}
        visible={modalVisible}
        cancel={cancel}
        modalWrapperClassName="inviteModalWrapper"
        >
        {/* 搜索框 */}
        <SearchBox
          searchFieldChange={value => this.searchFieldChange(value)}
          isSearching={this.state.isSearching}
        />
        {/* 相关联系人的 ListItems 聊天列表*/}
        <ListItems
          dataList={isSearching ? contactedItems : homePageList}
          allGroupChats={allGroupChats}
          showAsContacts
          clickItem={chatFromId => this._clickItemHandle(chatFromId)}
        />
        {/* 底部的链接分享(复制链接) */}
        <div className="shareInviteLink" onClick={this._copyInviteLink}>
          <svg className="icon shareIcon" aria-hidden="true"><use xlinkHref="#icon-share1" /></svg>
          复制链接分享给应用外的人
        </div>
      </Modal>
    );
  }
}

export default withRouter(InviteModal);

InviteModal.propTypes = {
  clickInviteModalItem: PropTypes.func,
  homePageList: PropTypes.array,
  allGroupChats: PropTypes.instanceOf(Map),
  modalVisible: PropTypes.bool,
  cancel: PropTypes.func,
  chatId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};


InviteModal.defaultProps = {
  clickInviteModalItem() {}, // 邀请的处理函数
  homePageList: [], // 左侧聊天列表的相关关键信息
  allGroupChats: new Map(), // 全部群组聊天
  modalVisible: false, // 控制邀请弹框的显示和隐藏
  cancel() {}, // 隐藏邀请弹框
  chatId: null, // 当前的聊天id
};
