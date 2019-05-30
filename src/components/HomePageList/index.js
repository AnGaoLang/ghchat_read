import React, { Component } from 'react';
import {
  withRouter,
} from 'react-router-dom';
import Fuse from 'fuse.js'; // 模糊查询
import PropTypes from 'prop-types';
import { List } from 'immutable';
import Header from '../../containers/Header';
import './index.scss';
import ListItems from '../ListItems';
import Chat from '../../modules/Chat';
import InitApp from '../../modules/InitApp';

// import Spinner from '../Spinner';


class HomePageList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSearching: false, // 是否显示搜索页面
      contactedItems: [], // 搜索时获得的返回结果
      showSearchUser: true,
      showSearchGroup: true,
      searchResultTitle: { // 联系过的用户或群组
        user: '您联系过的用户',
        group: '您联系过的群组'
      }
    };
    this._userInfo = JSON.parse(localStorage.getItem('userInfo'));
    this._filedStr = null; // seacrh组件内表单的输入值
    this._chat = new Chat();
    this._cleanedUnread = false;
  }

  componentWillMount() {
    if (!this.props.initializedApp) {
      this._InitApp = new InitApp({ history: this.props.history });
      this._InitApp.init();
      this.props.initApp(true);
    }
  }
  
  componentDidUpdate() {
    if (this._cleanedUnread || !this.props.initializedApp) return;
    this._cleanUnreadWhenReload();
  }

  _cleanUnreadWhenReload = () => {
    const { homePageList } = this.props;
    const chatFromId = window.location.pathname.split(/^\/\S+_chat\//)[1]; // 拿到群组或用户的id
    // 筛选出homePageList里和chatFromId相匹配的项
    const filter = homePageList.filter(e => chatFromId && (chatFromId === e.to_group_id || chatFromId === (e.user_id && (e.user_id).toString())));
    const goal = filter[0]; // 取得拿到的结果
    if (goal && goal.unread !== 0) {
      this._chat.clearUnreadHandle({ homePageList, chatFromId });
      this._cleanedUnread = true;
    }
  }
  
  // 搜索的筛选条件
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

  // 搜索框输入时的处理函数，参数为传入输入文本框的值
  searchFieldChange(field) {
    this._filedStr = field.toString(); // 表单输入的值转为字符串
    this.setState({
      showSearchUser: true, // 是否显示网络查找相关的用户
      showSearchGroup: true, // 是否显示网络查找相关的群组
      searchResultTitle: {
        user: '您联系过的用户',
        group: '您联系过的群组'
      }
    });
    if (this._filedStr.length > 0) {
      const { homePageList } = this.props;
      const homePageListCopy = [...List(homePageList)];  // 拷贝一个聊天框列表，并转换为不可变数据
      // 模糊搜索
      const fuse = new Fuse(homePageListCopy, this.filterOptions);
      const contactedItems = fuse.search(this._filedStr);
      this.setState({ isSearching: true, contactedItems }); // 搜索时让输入值可以写入input框，显示搜索结果页面，并获得的返回结果
    } else {
      this.setState({ isSearching: false }); // 没值直接隐藏
    }
  }

  // 网络查找相关用户或网络相关群组（数据库内查找）
  searchInDB({ searchUser }) {
    window.socket.emit('fuzzyMatch', { field: this._filedStr, searchUser }, (data) => {
      if (data.searchUser) {
        this.setState(state => ({
          showSearchUser: false, // 查找数据库后，隐藏'网络查找相关的用户'
          searchResultTitle: { ...state.searchResultTitle, user: '所有用户' } // 更改小标题为所有用户
        }));
        data.fuzzyMatchResult.forEach((element) => {
          element.user_id = element.id;
        });
      } else {
        this.setState(state => ({
          showSearchGroup: false, // 查找数据库后，隐藏'网络查找相关的群组'
          searchResultTitle: { ...state.searchResultTitle, group: '所有群组' } // 更改小标题为所有群组
        }));
      }
      this.setState(state => ({ contactedItems: [...state.contactedItems, ...data.fuzzyMatchResult] }));
    });
  }

  clickItemHandle = ({ homePageList, chatFromId }) => {
    if (this.state.isSearching) {
      this.setState({ isSearching: false });
    }
    this._chat.clearUnreadHandle({ homePageList, chatFromId });
    // clear [有人@我] [@Me]
    this.props.showCallMeTip({ homePageList, chatFromId, showCallMeTip: false });
  }

  render() {
    const { homePageList, allGroupChats } = this.props;
    homePageList.sort((a, b) => b.time - a.time); // 聊天框排序
    const {
      isSearching, contactedItems,
      showSearchUser, showSearchGroup,
      searchResultTitle
    } = this.state;
    const contactedUsers = contactedItems.filter(e => (e.user_id && e.user_id !== this._userInfo.user_id)); // 筛选出所有非本号用户搜索结果
    const contactedGroups = contactedItems.filter(e => e.to_group_id); // 筛选出所有群组搜索结果
    return (
      <div className="home-page-list-wrapper">
        {/*打开github 头部的搜索栏，创建群组 */}
        <Header searchFieldChange={field => this.searchFieldChange(field)} isSearching={isSearching} />
        {/* 主聊天列表 */}
        <div className="home-page-list-content">
          {/* isSearching为真，显示搜索结果页面。为false，默认显示聊天列表*/}
          {isSearching ? (
            <div className="searchResult">
              {/* 小标题 联系过的用户 */}
              <p className="searchResultTitle">{searchResultTitle.user}</p>
              {/* 用户搜索结果组成的列表 没有就显示暂无 */}
              { contactedUsers.length
                ? (

                  <ListItems
                    isSearching={isSearching}
                    dataList={contactedUsers}
                    allGroupChats={allGroupChats}
                    clickItem={chatFromId => this.clickItemHandle({ homePageList, chatFromId })} />
                )
                : <p className="search-none">暂无</p>}
              {/* 是否在数据库中查找 */}
              { showSearchUser && (
              <p
                className="clickToSearch"
                onClick={() => this.searchInDB({ searchUser: true })}>
                网络查找相关的用户
              </p>
              )}
              {/* 小标题 联系过的群组 */}
              <p className="searchResultTitle">{searchResultTitle.group}</p>
              {/* 群组搜索结果组成的列表 没有就显示暂无 */}
              { contactedGroups.length
                ? (
                  <ListItems
                    isSearching={isSearching}
                    dataList={contactedGroups}
                    allGroupChats={allGroupChats}
                    clickItem={chatFromId => this.clickItemHandle({ homePageList, chatFromId })} />
                )
                : <p className="search-none">暂无</p>}
              {/* 是否在数据库中查找 */}
              { showSearchGroup && (
              <p
                className="clickToSearch"
                onClick={() => this.searchInDB({ searchUser: false })}>
                网络查找相关的群组
              </p>
              )}
            </div>
          )
            : (
              <ListItems
                dataList={homePageList}
                allGroupChats={allGroupChats}
                showRobot
                clickItem={chatFromId => this.clickItemHandle({ homePageList, chatFromId })}
                 />
            )}
        </div>
      </div>
    );
  }
}

export default withRouter(HomePageList);

HomePageList.propTypes = {
  allGroupChats: PropTypes.instanceOf(Map),
  homePageList: PropTypes.array,
  showCallMeTip: PropTypes.func,
  initializedApp: PropTypes.bool,
  initApp: PropTypes.func,
};


HomePageList.defaultProps = {
  allGroupChats: new Map(),
  homePageList: [], // 聊天框列表
  showCallMeTip() {},
  initializedApp: false,
  initApp() {},
};
