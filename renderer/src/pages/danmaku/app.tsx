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
  IPacketWatchedChange,
} from '@@lib/bililive/common/entity';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';

import { useDynamicList } from 'ahooks';

import guardV3 from '../../../public/guard-3.webp';
import guardV2 from '../../../public/guard-2.webp';

const getGuardIcon = (guardLevel: number) => {
  return {
    2: guardV2,
    3: guardV3,
  }[guardLevel];
};

interface MessageItem {
  key: string;
  content: string | React.ReactElement;
  icon?: string;
}

interface IEnterRoomItem {
  key: string;
  name: string;
  type: string;
}

export function App() {
  const [popularity, setPopularity] = useState(0);
  const [watchedChange, setWatchedChange] = useState({
    num: 0,
  } as IPacketWatchedChange);
  const [leftBottomOverlayVisible, setLeftBottomOverlayVisible] =
    useState(false);
  const danmakuList = useDynamicList<MessageItem>([]);
  const enterList = useDynamicList<IEnterRoomItem>([]);
  const { colorMode, toggleColorMode } = useColorMode();
  const renderMedal = (danmaku: IDanmaku) => {
    console.log(`🚀 ~ file: app.tsx:36 ~ renderBadge ~ danmaku:`, danmaku);
    if (!danmaku.medal) {
      return null;
    }
    if (Object.keys(danmaku.medal).length === 0) {
      return null;
    }
    const baseColor = `#${danmaku.medal.baseColor
      .toString(16)
      .padStart(6, '0')}`;
    const borderColor = `#${danmaku.medal.borderColor
      .toString(16)
      .padStart(6, '0')}`;
    const nextColor = `#${danmaku.medal.nextColor
      .toString(16)
      .padStart(6, '0')}`;
    console.log(`🚀 ~ file: app.tsx:42 ~ renderBadge ~ color:`, baseColor);
    return (
      <span
        className='badge'
        style={{
          marginRight: '0.5em',
          borderRadius: '0.1em 0 0 0.1em',
          borderStyle: 'solid',
          borderWidth: '1px',
          borderColor: borderColor,
          fontSize: '14px',
          display: 'flex',
          height: '22px',
          lineHeight: '20px',
          boxSizing: 'content-box',
        }}
      >
        <span
          className='badge-name'
          style={{
            display: 'flex',
            padding: '0 0.5em',
            borderRadius: '0.1em 0 0 0.1em',
            borderStyle: 'solid',
            borderWidth: '1px',
            backgroundImage: `linear-gradient(45deg, ${baseColor}, ${nextColor})`,
            color: 'white',
          }}
        >
          <span
            style={{
              display: danmaku.medal.guardLevel > 1 ? 'inline-block' : 'none',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'contain',
              backgroundPosition: 'center center',
              marginRight: '2px',
              backgroundImage: `url(${getGuardIcon(danmaku.medal.guardLevel)})`,
              width: '22px',
              height: '22px',
              marginLeft: '-12px',
            }}
          ></span>
          {danmaku.medal.name}
        </span>
        <span
          className='badge-level'
          style={{
            padding: '0 0.2em',
            lineHeight: '22px',
            color: baseColor,
          }}
        >
          {danmaku.medal.level}
        </span>
      </span>
    );
  };

  // const renderLevel = (danmaku: IDanmaku) => {
  //   const color = `#${danmaku.levelColor.toString(16)}`;

  //   return (
  //     <Box
  //       as='span'
  //       className='level'
  //       color={color}
  //       borderColor={color}
  //       padding={'0 0.2em'}
  //       borderRadius={'0.1em'}
  //       borderStyle={'solid'}
  //       borderWidth={'1px'}
  //       marginRight={'0.5em'}
  //     >
  //       UL {danmaku.level}
  //     </Box>
  //   );
  // };

  const renderDanmaku = (danmaku: IDanmaku) => {
    return (
      <Box display={'inline-flex'} height={'24px'}>
        {renderMedal(danmaku)}
        {/* 官方都已经不显示 level 了，这里也不显示了 */}
        {/* {renderLevel(danmaku)} */}
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
          console.log(`🚀 ~ file: app.tsx:131 ~ eventListener ~ gift:`, gift);
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
          enterList.push({
            key: `${welcome.username} 进入了直播间` + Date.now(),
            name: welcome.username,
            type: name,
          });
        } else if (name === ENotificationType.WATCHED_CHANGE) {
          const watchedChange = data as IPacketWatchedChange;
          setWatchedChange(watchedChange);
        }
      }
    };

    window.addEventListener(danmakuNotificationChannel, eventListener);
    return () => {
      window.removeEventListener(danmakuNotificationChannel, eventListener);
    };
  }, []);
  return (
    <Box className='app-container'>
      <Box className='header'>当前人气：{popularity}</Box>
      <Box className='danmaku-container' mb={'60px'} overflow={'hidden'}>
        <List spacing={3}>
          {danmakuList.list.map((item) => {
            return <ListItem key={item.key}>{item.content}</ListItem>;
          })}
        </List>
      </Box>
      <Box marginTop={'50px'} className='danmaku-container' overflow={'hidden'}>
        <List spacing={3}>
          {enterList.list.slice(enterList.list.length - 2).map((item) => {
            return <ListItem key={item.key}>{item.name} 进入了直播间</ListItem>;
          })}
        </List>
      </Box>
      <Box
        position={'fixed'}
        left={5}
        bottom={5}
        padding={'0.5em'}
        onMouseOver={() => {
          setLeftBottomOverlayVisible(true);
        }}
        onMouseLeave={() => {
          setLeftBottomOverlayVisible(false);
        }}
      >
        <Box visibility={leftBottomOverlayVisible ? 'visible' : 'hidden'}>
          {colorMode === 'light' ? (
            <MoonIcon
              _hover={{
                cursor: 'pointer',
              }}
              boxSize={6}
              onClick={toggleColorMode}
            ></MoonIcon>
          ) : (
            <SunIcon
              _hover={{
                cursor: 'pointer',
              }}
              boxSize={6}
              onClick={toggleColorMode}
            ></SunIcon>
          )}
          {watchedChange.num} 人看过
        </Box>
      </Box>
    </Box>
  );
}
