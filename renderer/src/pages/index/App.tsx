import './App.css';
import { useLocalStorageState } from 'ahooks';
import { Box } from '@chakra-ui/react';
import React from 'react';

function App() {
  const [roomId, setRoomId] = useLocalStorageState('roomId', {
    defaultValue: '',
  });
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
            <Box as='span' cursor={'pointer'} onClick={() => setRoomId(item)}>
              {item}
            </Box>
          );
        })}
      </Box>
    );
  }, [history]);

  return (
    <>
      <h1>请输入房间号</h1>
      <input
        value={roomId}
        onChange={(event) => {
          setRoomId(event.target.value);
        }}
      ></input>
      {renderHistory()}
      <div className='card'>
        <button
          onClick={() => {
            if (!roomId) {
              alert('请输入房间号');
              return;
            }

            setHistory([roomId, ...(history ?? [])]);
            danmaku.open(roomId);
          }}
        >
          Open Danmaku Page
        </button>
      </div>
    </>
  );
}

export default App;
