import './App.css';
import { useLocalStorageState } from 'ahooks';

function App() {
  const [roomId, setRoomId] = useLocalStorageState('roomId', {
    defaultValue: '',
  });

  return (
    <>
      <h1>请输入房间号</h1>
      <input
        value={roomId}
        onChange={(event) => {
          setRoomId(event.target.value);
        }}
      ></input>
      <div className='card'>
        <button
          onClick={() => {
            if (!roomId) {
              alert('请输入房间号');
              return;
            }
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
