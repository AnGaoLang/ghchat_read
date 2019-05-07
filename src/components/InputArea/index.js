import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Picker } from 'emoji-mart'; // 表情包组件
import Fuse from 'fuse.js';
import upload from '../../utils/qiniu';
import './style.scss';
import notification from '../Notification';
import debounce from '../../utils/debounce';
import { inviteAction } from '../../redux/actions/inviteAction';
import store from '../../redux/store';

export default class InputArea extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputMsg: '', // 输入的信息
      showEmojiPicker: false, // 是否显示表情选择组件，默认不显示
      relatedMembers: [], // @时显示的关联成员
    };
    this._placeholder = null; // input的占位符
    this._onPaste = props.isRobotChat ? () => {} : this._paste;
    // this._onPaste = props.isRobotChat ? () => {} : debounce(this._paste, 2000, true); // 经过debounce优化的this._paste函数调用
  }

  componentWillMount() {
    // 初始化textarea的提示文本
    if (/group_chat/.test(window.location.href)) {
      this._placeholder = '支持Enter发信息/粘贴发图/@别人哦'; // 群组聊天
    } else if (this.props.isRobotChat) {
      this._placeholder = '支持Enter发信息哦'; // 和机器人聊天
    } else { // private chat
      this._placeholder = '支持Enter发信息/粘贴发图哦'; // 和个人聊天
    }
  }

  componentDidMount() {
    if (this.props.inviteData) {
      this._sendMessage({ message: (`::invite::${JSON.stringify(this.props.inviteData)}`) });
      store.dispatch(inviteAction(null));
    };
    this.nameInput.focus(); // 聚焦textarea
  }

  // 发送消息
  _sendMessage = ({ attachments = [], message }) => {
    console.log(attachments)
    // 没有输入消息则不发送消息
    const { inputMsg } = this.state;
    if (!inputMsg) return;
    // 有输入消息。

    const { sendMessage } = this.props;
    sendMessage(message || inputMsg, attachments); // 父组件传递进来的发送消息函数
    // this.setState({inputMsg: ''});
    this.state.inputMsg = ''; // 还原清空textarea(在sendMessage里调用了setState),父子组件作为不同的class实例，改变同名的state会互相影响？
    this.nameInput.focus(); // 聚焦textarea
  }

  // 按下回车键时，发送消息
  _keyPress = (e) => {
    if (
      e.key === 'Enter'
        && !e.shiftKey // shift键是否被按下
        && !e.ctrlKey // ctrl键是否被按下
        && !e.altKey // alt键是否被按下
    ) {
      this._sendMessage({});
      e.preventDefault();
    }
  }

  // 模糊搜索限制条件，以name为关键字进行搜索
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

  // 是否@某个人
  _selectSomeOneOrNot = () => {
    const { inputMsg } = this.state;
    const shouldPrompt = /\S*@$|\S*@\S+$/.test(inputMsg); // 非空字符{0,}且以@结尾 / 非空字符{0,}+@+非空字符结尾{1,}
    // 没有@则将@的关联成员清空
    if (!shouldPrompt) {
      this.setState({ relatedMembers: [] });
      return;
    };
    // 群组内的所有成员
    const groupMembers = this.props.groupMembers;
    if (groupMembers && groupMembers.length > 1) {
      const fuse = new Fuse(groupMembers, this.filterOptions); // 实例化一个fuse
      const filterText = /@\S*$/.exec(inputMsg)[0].slice(1); // 取出@...后面的文本内容
      const relatedMembers = filterText ? fuse.search(filterText) : groupMembers; // 如果@后有内容，则进行模糊搜索，@后为空，则返回所有成员
      this.setState({ relatedMembers }); // 更新@关联成员
    }
  }

  // 文本框输入时，改变inputMsg和textarea的值,如果有@，则进行@处理
  _inputMsgChange = (event) => {
    this.setState({
      inputMsg: event.target.value
    }, () => {
      this._selectSomeOneOrNot(); // 是都@了某人
    });
  }

  // 显示或隐藏表情选择组件
  _clickShowEmojiPicker = () => {
    const { showEmojiPicker } = this.state;
    this.setState({ showEmojiPicker: !showEmojiPicker });
  }

  // 选择表情
  _selectEmoji = (emoji) => {
    this.setState(state => ({ inputMsg: `${state.inputMsg} ${emoji.colons}` }));
    this._clickShowEmojiPicker();
    this.nameInput.focus();
    console.log(emoji)
  }

  // 上传文件
  _onSelectFile = (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }
    const reader = new FileReader(); // 实例化一个fileReader对象
    // 读取文件完成后的回调，不论成功或失败
    reader.onloadend = (event) => {
      const limitSize = 1000 * 1024 * 2; // 2 MB
      if (file.size > limitSize) {
        notification('发的文件不能超过2MB哦!', 'warn', 2);
        return;
      }
      if (event.target.readyState === FileReader.DONE) { // (0:FileReader.EMPTY, 1:FileReader.LOADING, 2:FileReader.DONE)
        upload(file, (fileUrl) => {
          const type = file.type.split('/')[0];
          const attachments = [{ fileUrl, type, name: file.name }];
          this._sendMessage({ attachments });
        });
      }
    };
    reader.readAsArrayBuffer(file); // 读取上传的文件
  }

  // @某人时，选择某一相关成员
  _clickSomeOneSelected = (name) => {
    this.setState((state) => {
      const newInputMsg = state.inputMsg.replace(/@\S*$/, `@${name} `); // 替换inputMsg中 @.. 部分为被选中的 @相关成员
      return ({ inputMsg: newInputMsg, relatedMembers: [] }); // 更新inputMsg，并清空相关成员数组(relatedMembers)
    }, () => {
      this.nameInput.focus(); // 聚焦textarea
    });
  }

  // 渲染@某人时，提示展示的所有相关成员
  filterMembersRender = () => {
    const { relatedMembers } = this.state;
    return (
      <ul className="filterMembers">
        {relatedMembers && relatedMembers.length > 0 && relatedMembers.map((e, index) => (
          <li key={index} onClick={() => this._clickSomeOneSelected(e.name)}>
            {e.name}
          </li>
        ))}
      </ul>
    );
  }

  // 粘贴操作的处理函数，如果粘贴的不是文件，则不进行处理。
  _paste = (e) => {
    // clipboardData为一个dataTransfer属性
    const clipboardData = (e.clipboardData || e.originalEvent.clipboardData); // 如果e上拿不到clipboardData，则到原生事件对象originalEvent上去拿
    // const types = clipboardData && clipboardData.types; // 类型数组集合
    /* 用 items 能支持更多的浏览器, 获取剪切板的内容 */
    const items = clipboardData && clipboardData.items;
     // 没有内容则直接返回
    if (!items) return;
    const len = items.length;
    // 遍历dataTransfer里的每一项DataTransferItem
    for (let i = 0; i < len; i++) {
      if (items[i].kind === 'file') { // kind拖拽项的性质，string或file
        e.preventDefault();
        const file = items[i].getAsFile(); // 获取文件
        if (!file) {
          return;
        }
        const limitSize = 1000 * 1024 * 2; // 粘贴的文件不能超过2 MB
        if (file.size > limitSize) {
          notification('发的文件不能超过2MB哦!', 'warn', 2);
          return;
        };
        // 上传粘贴的文件，并发送消息
        upload(file, (fileUrl) => {
          const type = file.type.split('/')[0];
          const attachments = [{ fileUrl, type, name: file.name }];
          this._sendMessage({ attachments });
        });
      }
    }
  }

  render() {
    const { inputMsg, showEmojiPicker, relatedMembers } = this.state;
    // 机器人聊天隐藏表情选择和文件上传
    const robotStyle = {
      visibility: 'hidden'
    };
    // 文本框有内容时使用激活样式，无内容时使用灰色样式
    const buttonClass = inputMsg ? 'btn btnActive' : 'btn';
    // onKeyPressCapture 以捕获的方式触发事件
    return (
      <div className="input-msg">
        <div className="left" style={this.props.isRobotChat ? robotStyle : {}}>
          {/* emoji */}
          <svg onClick={this._clickShowEmojiPicker} className="icon emoji" aria-hidden="true"><use xlinkHref="#icon-smile" /></svg>
          {/* file upload */}
          <label className="file">
            <svg className="icon" aria-hidden="true"><use xlinkHref="#icon-file" /></svg>
            <input type="file" className="file-input" onChange={this._onSelectFile} />
          </label>
        </div>
        { relatedMembers && relatedMembers.length > 0 && this.filterMembersRender()}
        {/* textarea */}
        <textarea
          ref={(input) => { this.nameInput = input; }}
          value={inputMsg}
          onChange={this._inputMsgChange}
          placeholder={this._placeholder}
          onPaste={this._onPaste}
          onKeyPressCapture={this._keyPress} />
        {/* <pre id="textarea" /> */}
        <p className={buttonClass} onClick={this._sendMessage}>发送</p>

        {/* emojiPicker mask */}
        { showEmojiPicker && <div onClick={this._clickShowEmojiPicker} className="mask" />}
        {/* emojiPicker component */}
        { showEmojiPicker && <Picker onSelect={this._selectEmoji} backgroundImageFn={(() => 'https://cdn.aermin.top/emojione.png')} showPreview={true} />}
      </div>
    );
  }
}


InputArea.propTypes = {
  sendMessage: PropTypes.func,
  isRobotChat: PropTypes.bool,
  inviteData: PropTypes.object,
};


InputArea.defaultProps = {
  sendMessage: undefined,
  isRobotChat: false,
  inviteData: undefined,
};
