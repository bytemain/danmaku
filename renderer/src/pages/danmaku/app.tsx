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

export function App() {
  const [popularity, setPopularity] = useState(0);
  const danmakuList = useDynamicList<IDanmaku>([]);

  useEffect(() => {
    const eventListener = (event: Event) => {
      const data = (event as MessageEvent).data;
      console.log(`🚀 ~ file: app.tsx:25 ~ eventListener ~ data:`, data);
      if (data.type === EDanmakuEventName.POPULARITY) {
        setPopularity(data.popularity);
      } else if (data.type === EDanmakuEventName.DANMAKU) {
        const danmaku = data.danmaku as IDanmaku;
        danmakuList.push(danmaku);
      } else if (data.type === EDanmakuEventName.GIFT) {
        const gift = data.gift as IGift;
      } else if (data.type === EDanmakuEventName.WELCOME) {
        const welcome = data.welcome as IWelcome;
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
          {danmakuList.list.map((danmaku) => {
            return (
              <ListItem key={danmaku.content}>
                <ListIcon as={MdCheckCircle} color='green.500' />
                {danmaku.username}: {danmaku.content}
              </ListItem>
            );
          })}
        </List>
      </div>
    </div>
  );
}
