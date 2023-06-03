import './app.css';
import { useEffect, useState } from 'react';
import {
  List,
  ListItem,
  ListIcon,
  OrderedList,
  UnorderedList,
} from '@chakra-ui/react';
import { MdSettings, MdCheckCircle } from 'react-icons/md';
import { danmakuNotificationChannel } from '../../../../common/ipc';
import {
  IDanmaku,
  IGift,
  IWelcome,
  EDanmakuEventName,
} from '../../../../common/types/danmaku';
import { useDynamicList } from 'ahooks';

interface MessageItem {
  key: string;
  content: string;
  icon?: string;
}

export function App() {
  const [popularity, setPopularity] = useState(0);
  const danmakuList = useDynamicList<MessageItem>([]);

  useEffect(() => {
    const eventListener = (event: Event) => {
      const data = (event as MessageEvent).data;
      console.log(`🚀 ~ file: app.tsx:25 ~ eventListener ~ data:`, data);
      if (data.type === EDanmakuEventName.POPULARITY) {
        setPopularity(data.popularity);
      } else if (data.type === EDanmakuEventName.DANMAKU) {
        const danmaku = data.danmaku as IDanmaku;
        danmakuList.push({
          key: `${danmaku.username}: ${danmaku.content}` + Date.now(),
          content: `${danmaku.username}: ${danmaku.content}`,
        });
      } else if (data.type === EDanmakuEventName.GIFT) {
        const gift = data.gift as IGift;
        danmakuList.push({
          key:
            `${gift.username} 赠送了 ${gift.num} 个 ${gift.giftName}` +
            Date.now(),
          content: `${gift.username} 赠送了 ${gift.num} 个 ${gift.giftName}`,
        });
      } else if (data.type === EDanmakuEventName.WELCOME) {
        const welcome = data.welcome as IWelcome;
        danmakuList.push({
          key: `${welcome.username} 进入了直播间` + Date.now(),
          content: `${welcome.username} 进入了直播间`,
        });
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
            return (
              <ListItem key={item.key}>
                <ListIcon as={MdCheckCircle} color='green.500' />
                {item.content}
              </ListItem>
            );
          })}
        </List>
      </div>
    </div>
  );
}
