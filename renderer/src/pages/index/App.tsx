import './App.css';
import { useLocalStorageState } from 'ahooks';
import { Box, Button, Grid, GridItem, List, ListItem } from '@chakra-ui/react';
import React from 'react';
import uniq from 'lodash/uniq';
import { useState } from 'react';

function App() {
  const [roomId, setRoomId] = useLocalStorageState('roomId', {
    defaultValue: '',
  });
  const renderDanmaku = () => {
    return (
      <Box className='danmaku-entry'>
        <h1>请输入房间号</h1>
        <input
          value={roomId}
          onChange={(event) => {
            setRoomId(event.target.value);
          }}
        ></input>
        {renderHistory()}
        <Box className='card'>
          <Button
            onClick={() => {
              if (!roomId) {
                alert('请输入房间号');
                return;
              }

              setHistory(uniq([roomId, ...(history ?? [])]));
              danmaku.open(roomId);
            }}
          >
            Open Danmaku Page
          </Button>
        </Box>
      </Box>
    );
  };

  const renderRoomManage = () => {
    return (
      <webview
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
        }}
        partition='persist:bilibili'
        src='https://link.bilibili.com/p/center/index#/my-room/start-live'
      ></webview>
    );
  };

  const panes = {
    danmaku: renderDanmaku,
    roomManage: renderRoomManage,
  } as Record<string, () => JSX.Element>;

  const [activePane, setActivePane] = useState(Object.keys(panes)[0]);
  const [history, setHistory] = useLocalStorageState<string[]>(
    'roomIdHistory',
    {
      defaultValue: [] as string[],
    }
  );

  const renderHistory = React.useCallback(() => {
    if (!history || history.length === 0) {
      return null;
    }
    return (
      <Box>
        <Box>History:</Box>
        {history.map((item) => {
          return (
            <Box
              pr={2}
              as='span'
              cursor={'pointer'}
              onClick={() => setRoomId(item)}
            >
              {item}
            </Box>
          );
        })}
      </Box>
    );
  }, [history, setRoomId]);

  return (
    <Grid
      templateAreas={`"header header"
                  "nav main"
                  "nav footer"`}
      gridTemplateRows={'50px 1fr 30px'}
      gridTemplateColumns={'150px 1fr'}
      h='100vh'
      w='100vw'
      gap='1'
      color='blackAlpha.700'
    >
      <GridItem pl='2' bg='orange.300' area={'header'}>
        Header
      </GridItem>
      <GridItem pl='2' bg='pink.300' area={'nav'}>
        <List spacing={3}>
          {Object.keys(panes).map((key) => {
            return (
              <ListItem>
                <Button onClick={() => setActivePane(key)}>{key}</Button>
              </ListItem>
            );
          })}
        </List>
      </GridItem>
      <GridItem pl='2' bg='green.300' area={'main'}>
        {activePane &&
          typeof panes[activePane] === 'function' &&
          panes[activePane]()}
      </GridItem>
      <GridItem pl='2' bg='blue.300' area={'footer'}>
        Footer
      </GridItem>
    </Grid>
  );
}

export default App;
