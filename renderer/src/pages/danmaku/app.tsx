import './app.css';
import { useEffect, useState } from 'react';
import { List, ListItem, useColorMode, Box } from '@chakra-ui/react';
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
import { MoonIcon, SunIcon } from '@chakra-ui/icons';

import { useDynamicList } from 'ahooks';

interface MessageItem {
  key: string;
  content: string | React.ReactElement;
  icon?: string;
}

export function App() {
  const [popularity, setPopularity] = useState(0);
  const danmakuList = useDynamicList<MessageItem>([]);
  const { colorMode, toggleColorMode } = useColorMode();
  const renderBadge = (danmaku: IDanmaku) => {
    if (!danmaku.medal) {
      return null;
    }
    if (Object.keys(danmaku.medal).length === 0) {
      return null;
    }
    const color = `#${danmaku.medal.color.toString(16)}`;
    return (
      <Box as='span' className='badge' marginRight={'0.5em'}>
        <Box
          as='span'
          className='badge-name'
          padding={'0 0.5em'}
          borderRadius={'0.1em 0 0 0.1em'}
          borderStyle={'solid'}
          borderWidth={'1px'}
          style={{
            borderColor: color,
            backgroundColor: color,
          }}
        >
          {danmaku.medal.name}
        </Box>
        <Box
          as='span'
          style={{
            borderColor: color,
          }}
          className='badge-level'
          padding={'0 0.2em'}
          borderRadius={' 0 0.1em 0.1em 0'}
          borderStyle={'solid'}
          borderWidth={'1px'}
        >
          {danmaku.medal.level}
        </Box>
      </Box>
    );
  };

  const renderLevel = (danmaku: IDanmaku) => {
    const color = `#${danmaku.levelColor.toString(16)}`;

    return (
      <Box
        as='span'
        className='level'
        color={color}
        borderColor={color}
        padding={'0 0.2em'}
        borderRadius={'0.1em'}
        borderStyle={'solid'}
        borderWidth={'1px'}
        marginRight={'0.5em'}
      >
        UL {danmaku.level}
      </Box>
    );
  };

  const renderDanmaku = (danmaku: IDanmaku) => {
    return (
      <Box>
        {renderBadge(danmaku)}
        {renderLevel(danmaku)}
        <Box as='span' className='username'>
          {danmaku.username}
        </Box>
        :
        <Box
          as='span'
          className='content'
          overflowWrap={'anywhere'}
          wordBreak={'break-all'}
          lineHeight={'1.5em'}
        >
          {danmaku.content}
        </Box>
      </Box>
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
      <Box position={'fixed'} left={5} bottom={5}>
        {colorMode === 'light' ? (
          <MoonIcon boxSize={6} onClick={toggleColorMode}></MoonIcon>
        ) : (
          <SunIcon boxSize={6} onClick={toggleColorMode}></SunIcon>
        )}
      </Box>
    </div>
  );
}
