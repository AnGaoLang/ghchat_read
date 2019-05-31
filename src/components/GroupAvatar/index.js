import React from 'react';
import './styles.scss';
import UserAvatar from '../UserAvatar';

// 群组的头像，members 群组的成员数组
function GroupAvatar({ members }) {
  // 如果当前群组没有成员
  if (!members.length) return <UserAvatar name="?" size="46" borderRadius="50%" />;
  const willRenderMembers = members.slice(0, 4); // 返回第一个到第四个数组成员
  // 返回前四个成员的头像，组成群组的头像
  const avatarRender = willRenderMembers.map((e) => {
    const size = `${46 / 2}`; // 成员头像的尺寸(width;height)
    return <UserAvatar key={e.user_id} src={e.avatar} name={e.name} size={size} borderRadius="0%" />;
  });

  // flex布局，前四个群组成员自动换行排列；类似于钉钉
  return (
    <div className="groupAvatar">
      {avatarRender}
    </div>
  );
}


export default GroupAvatar;
