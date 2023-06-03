import reactLogo from '@/assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { useLocalStorageState } from 'ahooks';

function App() {
  const [roomId, setRoomId] = useLocalStorageState('roomId', {
    defaultValue: '',
  });

  return (
    <>
      <div>
        <a href='https://vitejs.dev' target='_blank'>
          <img src={viteLogo} className='logo' alt='Vite logo' />
        </a>
        <a href='https://react.dev' target='_blank'>
          <img src={reactLogo} className='logo react' alt='React logo' />
        </a>
      </div>
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
      <p className='read-the-docs'>
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
