import React, { Component } from 'react';
import {
  withRouter,
  Link
} from 'react-router-dom';
import PropTypes from 'prop-types';
import './style.scss';

// 左侧功能tab切换栏
class Tabs extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { pathname } = this.props.location;
    const showMessageIcon = pathname === '/' || /\/group_chat|\/private_chat|\/robot_chat/.test(pathname); // 正则判断路由，
    return (
      <div className="tabs-wrapper">
        {/* 路由定位到'/' */}
        <div className="tab">
          <Link to="/">
            <svg className="icon " aria-hidden="true">
              {/* 选中样式，还是非选中样式 */}
              <use xlinkHref={showMessageIcon ? '#icon-message-copy' : '#icon-message'} />
            </svg>
          </Link>
        </div>
        {/* 路由定位到'/setting' */}
        <div className="tab">
          <Link to="/setting">
            <svg className="icon " aria-hidden="true">
              {/* 选中样式，还是非选中样式 */}
              <use xlinkHref={pathname === '/setting' ? '#icon-setting-copy' : '#icon-setting'} />
            </svg>
          </Link>
        </div>
      </div>
    );
  }
}

export default withRouter(Tabs);


Tabs.propTypes = {
  location: PropTypes.object,
};


Tabs.defaultProps = {
  location: { pathname: '/' }
};
