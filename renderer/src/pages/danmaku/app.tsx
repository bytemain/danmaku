import './app.css';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useColorMode, Box, Flex, Spacer, Divider } from '@chakra-ui/react';
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
import { Virtuoso } from 'react-virtuoso';
import { useDynamicList } from 'ahooks';

import guardV3 from '../../../public/guard-3.webp';
import guardV2 from '../../../public/guard-2.webp';

const getGuardIcon = (guardLevel: number) => {
  return {
    2: guardV2,
    3: guardV3,
  }[guardLevel];
};

enum EMessageItemType {
  SystemMessage = 'SystemMessage',
}

interface IDanmakuItem {
  type: ENotificationType | EMessageItemType;
  data?: IDanmaku;
  gift?: IGift;
  welcome?: IWelcome;
  systemMessage?: string;
}

interface IEnterRoomItem {
  key: string;
  name: string;
  type: string;
}
const kLineHeight = 24;
const kLineHeightPx = `${kLineHeight}px`;

const kBottomBarHeight = `${kLineHeight + 8}px`;

const DanmakuItem = (props: { data: IDanmaku }) => {
  const { data: danmaku } = props;
  const renderMedal = (danmaku: IDanmaku) => {
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
          padding: '0',
          height: `${kLineHeight - 2}px}`,
          lineHeight: `${kLineHeight - 4}px}`,
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
  return (
    <Box display={'inline-flex'} height={kLineHeightPx} mt='3px'>
      {renderMedal(danmaku)}
      {/* 官方都已经不显示 level 了，这里也不显示了 */}
      {/* {renderLevel(danmaku)} */}
      <Box as='span' className='username'>
        {danmaku.username}
      </Box>
      :&nbsp;
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

const StickyBottomVirtualList = (props: {
  height: string;
  totalCount: number;
  itemContent: (index: number) => JSX.Element;
}) => {
  const { totalCount, itemContent, height } = props;
  const virtuosoRef = useRef(null);

  return (
    <Virtuoso
      ref={virtuosoRef}
      style={{ height }}
      totalCount={totalCount}
      itemContent={itemContent}
      followOutput={'auto'}
    />
  );
};

export function App() {
  const [popularity, setPopularity] = useState(0);
  const [watchedChange, setWatchedChange] = useState({
    num: 0,
  } as IPacketWatchedChange);
  const [leftBottomOverlayVisible, setLeftBottomOverlayVisible] =
    useState(false);
  const danmakuList = useDynamicList<IDanmakuItem>([]);

  const { colorMode, toggleColorMode } = useColorMode();
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
            type: ENotificationType.DANMU_MSG,
            data: danmaku,
          });
        } else if (name === ENotificationType.SEND_GIFT) {
          const gift = data as IGift;
          console.log(`🚀 ~ file: app.tsx:131 ~ eventListener ~ gift:`, gift);
          danmakuList.push({
            type: ENotificationType.SEND_GIFT,
            gift: gift,
          });
        } else if (
          name === ENotificationType.WELCOME ||
          name === ENotificationType.INTERACT_WORD
        ) {
          const welcome = data as IWelcome;
          danmakuList.push({
            type: ENotificationType.WELCOME,
            welcome,
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
  }, [danmakuList]);

  useEffect(() => {
    danmakuList.push({
      type: EMessageItemType.SystemMessage,
      systemMessage: '弹幕服务已连接',
    });
  }, []);

  useLayoutEffect(() => {
    operation.retrieveDanmaku();
  }, []);

  const danmakuItemContent = (index: number) => {
    const item = danmakuList.list[index];
    if (item.type === ENotificationType.DANMU_MSG) {
      const danmaku = item.data!;
      return (
        <DanmakuItem
          key={`${danmaku.username}: ${danmaku.content}` + danmaku.createdAt}
          data={danmaku}
        />
      );
    } else if (item.type === ENotificationType.SEND_GIFT) {
      const gift = item.gift!;
      return (
        <div
          style={{
            height: kLineHeightPx,
            lineHeight: kLineHeightPx,
          }}
          key={
            `${gift.username} 赠送了 ${gift.num} 个 ${gift.giftName}` +
            Date.now()
          }
        >
          {gift.username} 赠送了 {gift.num} 个 {gift.giftName}
        </div>
      );
    } else if (item.type === ENotificationType.WELCOME) {
      const welcome = item.welcome!;
      return (
        <div
          style={{
            height: kLineHeightPx,
            lineHeight: kLineHeightPx,
          }}
          key={`${welcome.username} 进入直播间` + Date.now()}
        >
          欢迎 {welcome.username} 进入直播间
        </div>
      );
    } else if (item.type === EMessageItemType.SystemMessage) {
      return (
        <div
          style={{
            height: kLineHeightPx,
            lineHeight: kLineHeightPx,
          }}
          key={item.systemMessage ?? '' + Date.now()}
        >
          {item.systemMessage}
        </div>
      );
    }
    return <></>;
  };

  return (
    <Box h='100vh' className='app-container'>
      <Flex height={'100vh'} direction={'column'}>
        <Box p='2px'>
          <StickyBottomVirtualList
            height={`calc(100vh - ${kLineHeightPx})`}
            totalCount={danmakuList.list.length}
            itemContent={danmakuItemContent}
          />
        </Box>
      </Flex>
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
        <Box
          visibility={leftBottomOverlayVisible ? 'visible' : 'hidden'}
          display={'flex'}
          backgroundColor={colorMode === 'light' ? 'white' : 'black'}
          p={2}
        >
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
          <Box ml='5px'>
            {watchedChange.num} 人看过，当前人气：{popularity}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
