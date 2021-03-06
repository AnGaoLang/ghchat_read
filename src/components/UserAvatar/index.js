// 感谢 https://www.npmjs.com/package/react-user-avatar
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './style.scss';

const defaultColors = [
  '#2ecc71', // emerald
  '#3498db', // peter river
  '#8e44ad', // wisteria
  '#e67e22', // carrot
  '#e74c3c', // alizarin
  '#1abc9c', // turquoise
  '#2c3e50', // midnight blue
];

function sumChars(str) {
  let sum = 0;
  for (let i = 0; i < str.length; i++) {
    sum += str.charCodeAt(i);
  }

  return sum;
}

// eslint-disable-next-line react/prefer-stateless-function
export default class UserAvatar extends Component {
  render() {
    const {
      src, // 图片链接
      name, // 用户名
      isGray, // 是否使用灰度模式
      color, //设置当以背景色
      colors = defaultColors,
      clickAvatar, // 点击头像触发的函数
      size, // 尺寸
      borderRadius, // 圆角尺寸
      showLogo, // 关联github账户后，是都显示github账户的logo
    } = this.props;

    if (!name) throw new Error('UserAvatar requires a name');

    const innerStyle = {
      textAlign: 'center',
      width: `${size}px`,
      height: `${size}px`,
      borderRadius,
      lineHeight: `${size}px`,
      color: 'white',
      display: 'inline-block',
    };

    const imgStyle = {
      width: `${size}px`,
      height: `${size}px`,
      borderRadius,
    };

    let inner;
    if (src) { // 有图片用图片
      inner = <img style={imgStyle} src={src} alt={name} />;
    } else { // 没传入图片则使用色块
      let background;
      if (color) {
        background = color;
      } else {
        // pick a deterministic color from the list
        const i = sumChars(name) % colors.length;
        background = colors[i];
      }

      innerStyle.backgroundColor = background;

      inner = <span>{name.charAt(0)}</span>;
    }

    const avatarClassName = isGray ? 'UserAvatar gray' : 'UserAvatar';
    return (
      <div className={avatarClassName} style={innerStyle} onClick={clickAvatar}>
        {showLogo && (
        <svg className="icon viaGithub" aria-hidden="true">
          <use xlinkHref="#icon-github" />
        </svg>
        )}
        {inner}
      </div>
    );
  }
}

UserAvatar.propTypes = {
  src: PropTypes.string,
  name: PropTypes.string.isRequired,
  isGray: PropTypes.bool,
  color: PropTypes.string,
  colors: PropTypes.array,
  clickAvatar: PropTypes.func,
  size: PropTypes.string,
  borderRadius: PropTypes.string,
  showLogo: PropTypes.bool,
};


UserAvatar.defaultProps = {
  src: undefined,
  isGray: false,
  color: undefined,
  colors: defaultColors,
  clickAvatar: undefined,
  size: '40',
  borderRadius: '50%',
  showLogo: false,
};
