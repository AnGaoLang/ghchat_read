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
      relatedMembers: [],
    };
    this._placeholder = null;
    this._onPaste = props.isRobotChat ? () => {} : debounce(this._paste, 2000, true);
  }

  componentWillMount() {
    if (/group_chat/.test(window.location.href)) {
      this._placeholder = '支持Enter发信息/粘贴发图/@别人哦';
    } else if (this.props.isRobotChat) {
      this._placeholder = '支持Enter发信息哦';
    } else { // private chat
      this._placeholder = '支持Enter发信息/粘贴发图哦';
    }
  }

  // 发送消息
  _sendMessage = ({ attachments = [], message }) => {
    const { sendMessage } = this.props;
    const { inputMsg } = this.state;
    sendMessage(message || inputMsg, attachments); // 父组件传递进来的发送消息函数
    // this.setState({inputMsg: ''});
    this.state.inputMsg = ''; // 还原清空textarea(在sendMessage里调用了setState),父子组件作为不同的class实例，改变同名的state会互相影响？
    this.nameInput.focus(); // 聚焦textarea
  }

  _selectSomeOneOrNot = () => {
    const { inputMsg } = this.state;
    const shouldPrompt = /\S*@$|\S*@\S+$/.test(inputMsg);
    if (!shouldPrompt) {
      // this.setState({ relatedMembers: [] });
      return;
    }
    const groupMembers = this.props.groupMembers;
    if (groupMembers && groupMembers.length > 1) {
      const fuse = new Fuse(groupMembers, this.filterOptions);
      const filterText = /@\S*$/.exec(inputMsg)[0].slice(1);
      const relatedMembers = filterText ? fuse.search(filterText) : groupMembers;
      // this.setState({ relatedMembers });
    }
  }

  _inputMsgChange = (event) => {
    this.setState({
      inputMsg: event.target.value
    }, () => {
      this._selectSomeOneOrNot();
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

  componentDidMount() {
    if (this.props.inviteData) {
      this._sendMessage({ message: (`::invite::${JSON.stringify(this.props.inviteData)}`) });
      store.dispatch(inviteAction(null));
    }
    this.nameInput.focus();
  }

  // 上传文件
  _onSelectFile = (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onloadend = (event) => {
      const limitSize = 1000 * 1024 * 2; // 2 MB
      if (file.size > limitSize) {
        notification('发的文件不能超过2MB哦!', 'warn', 2);
        return;
      }
      if (event.target.readyState === FileReader.DONE) {
        upload(file, (fileUrl) => {
          const type = file.type.split('/')[0];
          const attachments = [{ fileUrl, type, name: file.name }];
          this._sendMessage({ attachments });
        });
      }
    };
    reader.readAsArrayBuffer(file);
  }

  //  displayContents = (contents) => {
  //    console.log('contents', contents);
  //    //  this.setState({
  //    //    inputMsg: contents
  //    //  });
  //    const element = document.getElementById('textarea');
  //    element.textContent = contents;
  //  }

  _keyPress = (e) => {
    if (
      e.key === 'Enter'
        && !e.shiftKey
        && !e.ctrlKey
        && !e.altKey
    ) {
      this._sendMessage({ attachments: [] });
      e.preventDefault();
    }
  }

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

  _clickSomeOneSelected = (name) => {
    this.setState((state) => {
      const newInputMsg = state.inputMsg.replace(/@\S*$/, `@${name} `);
      return ({ inputMsg: newInputMsg, relatedMembers: [] });
    }, () => {
      this.nameInput.focus();
    });
  }

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

  _paste = (e) => {
    const clipboardData = (e.clipboardData || e.originalEvent.clipboardData);
    const items = clipboardData && clipboardData.items;
    if (!items) return;
    const len = items.length;
    for (let i = 0; i < len; i++) {
      if (items[i].kind === 'file') {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (!file) {
          return;
        }
        const limitSize = 1000 * 1024 * 2; // 2 MB
        if (file.size > limitSize) {
          notification('发的文件不能超过2MB哦!', 'warn', 2);
          return;
        }
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
    const buttonClass = inputMsg ? 'btn btnActive' : 'btn';
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
