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

  const renderRoom = () => {
    return (
      <webview
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
        }}
        partition='persist:bilibili'
        src='https://live.bilibili.com/1422245'
      ></webview>
    );
  };

  const panes = {
    danmaku: {
      render: renderDanmaku,
    },
    roomManage: {
      render: renderRoomManage,
      keepAlive: true,
    },
    room: {
      render: renderRoom,
      keepAlive: true,
    },
  } as Record<
    string,
    {
      render: () => JSX.Element;
      keepAlive?: boolean;
    }
  >;
  const paneNames = Object.keys(panes);
  const [activePane, setActivePane] = useState(paneNames[0]);
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
      gridTemplateRows={'0px 1fr 0px'}
      gridTemplateColumns={'150px 1fr'}
      h='100vh'
      w='100vw'
      gap='1'
      color='blackAlpha.700'
    >
      <GridItem bg='orange.300' area={'header'}>
        {/* Header */}
      </GridItem>
      <GridItem bg='pink.300' area={'nav'}>
        <List userSelect={'none'} spacing={3}>
          {Object.keys(panes).map((key) => {
            return (
              <ListItem>
                <Box
                  width={'100%'}
                  border={'1px solid'}
                  padding={2}
                  cursor={'pointer'}
                  onClick={() => setActivePane(key)}
                >
                  {key}
                </Box>
              </ListItem>
            );
          })}
        </List>
      </GridItem>
      <GridItem bg='green.300' area={'main'}>
        {paneNames.map((key) => {
          if (panes[key].keepAlive || activePane === key) {
            return (
              <Box
                key={key}
                style={{
                  display: activePane === key ? 'flex' : 'none',
                  width: '100%',
                  height: '100%',
                }}
              >
                {panes[key].render()}
              </Box>
            );
          }
          return null;
        })}
      </GridItem>
      <GridItem bg='blue.300' area={'footer'}>
        {/* Footer */}
      </GridItem>
    </Grid>
  );
}

export default App;
