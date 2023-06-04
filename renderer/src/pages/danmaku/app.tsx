import './app.css';
import { useEffect, useState } from 'react';
import { List, ListItem, ListIcon } from '@chakra-ui/react';
import { MdCheckCircle } from 'react-icons/md';
import { danmakuNotificationChannel } from '@@common/ipc';
import {
  EMessageEventType,
  ENotificationType,
} from '@@lib/bililive/common/types';
import {
  IGift,
  IWelcome,
  IPopularity,
  IDanmaku,
} from '@@lib/bililive/common/entity';

import { useDynamicList } from 'ahooks';

interface MessageItem {
  key: string;
  content: string | React.ReactElement;
  icon?: string;
}

export function App() {
  const [popularity, setPopularity] = useState(0);
  const danmakuList = useDynamicList<MessageItem>([]);

  const renderBadge = (danmaku: IDanmaku) => {
    if (!danmaku.medal) {
      return null;
    }
    if (Object.keys(danmaku.medal).length === 0) {
      return null;
    }
    const color = `#${danmaku.medal.color.toString(16)}`;
    return (
      <span className='badge'>
        <span
          className='badge-name'
          style={{
            borderColor: color,
            backgroundColor: color,
          }}
        >
          {danmaku.medal.name}
        </span>
      </span>
    );
  };

  const renderDanmaku = (danmaku: IDanmaku) => {
    return (
      <div>
        <ListIcon as={MdCheckCircle} color='green.500' />
        {renderBadge(danmaku)}
        <span className='username'>{danmaku.username}</span>:
        <span className='content'>{danmaku.content}</span>
      </div>
    );
  };

  useEffect(() => {
    const eventListener = (event: Event) => {
      const eventData = (event as MessageEvent).data;
      console.log(`🚀 ~ file: app.tsx:25 ~ eventListener ~ data:`, eventData);
      if (eventData.type === EMessageEventType.POPULARITY) {
        setPopularity((eventData.popularity as IPopularity).count);
      } else if (eventData.type === EMessageEventType.COMMAND) {
        const { data, name } = eventData.command;
        if (name === ENotificationType.DANMU_MSG) {
          const danmaku = data as IDanmaku;
          danmakuList.push({
            key: `${danmaku.username}: ${danmaku.content}` + danmaku.createdAt,
            content: renderDanmaku(danmaku),
          });
        } else if (name === ENotificationType.SEND_GIFT) {
          const gift = data as IGift;
          danmakuList.push({
            key:
              `${gift.username} 赠送了 ${gift.num} 个 ${gift.giftName}` +
              Date.now(),
            content: `${gift.username} 赠送了 ${gift.num} 个 ${gift.giftName}`,
          });
        } else if (
          name === ENotificationType.WELCOME ||
          name === ENotificationType.INTERACT_WORD
        ) {
          const welcome = data as IWelcome;
          danmakuList.push({
            key: `${welcome.username} 进入了直播间` + Date.now(),
            content: `${welcome.username} 进入了直播间`,
          });
        }
      }
    };

    window.addEventListener(danmakuNotificationChannel, eventListener);
    return () => {
      window.removeEventListener(danmakuNotificationChannel, eventListener);
    };
  }, []);
  return (
    <div className='app-container'>
      <header className='header'>当前人气：{popularity}</header>
      <div className='danmaku-container'>
        <List spacing={3}>
          {danmakuList.list.map((item) => {
            return <ListItem key={item.key}>{item.content}</ListItem>;
          })}
        </List>
      </div>
    </div>
  );
}
