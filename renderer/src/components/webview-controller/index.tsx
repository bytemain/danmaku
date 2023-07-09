import React from 'react';
import { Box, Button, Input } from '@chakra-ui/react';
import { WebviewTag } from '../../share';

interface IWebviewWithControllerProps {
  src: string;
  isPersist?: boolean;
  partition?: string;
}

export const WebviewWithController = (props: IWebviewWithControllerProps) => {
  const ref = React.useRef<WebviewTag>(null);
  const partition = props.isPersist
    ? `persist:${props.partition}`
    : props.partition;
  const [url, setUrl] = React.useState(props.src);

  React.useEffect(() => {
    const startLoading = () => {
      setUrl(ref.current?.getURL() || '');
    };
    const stopLoading = () => {
      setUrl(ref.current?.getURL() || '');
    };
    if (ref.current) {
      ref.current.addEventListener('did-start-loading', startLoading);
      ref.current.addEventListener('did-stop-loading', stopLoading);
    }
  }, [ref]);
  return (
    <Box width={'100%'} height={'100%'}>
      <Box className='controller-bar' display={'flex'}>
        <Input readOnly value={url}></Input>
        <Button
          onClick={() => {
            if (ref.current) {
              ref.current.reload();
            }
          }}
        >
          ↻
        </Button>
        <Button
          onClick={() => {
            if (ref.current) {
              ref.current.goBack();
            }
          }}
        >
          ←
        </Button>
        <Button
          onClick={() => {
            if (ref.current) {
              ref.current.goForward();
            }
          }}
        >
          →
        </Button>
        <Button
          onClick={() => {
            if (ref.current) {
              ref.current.loadURL(props.src);
            }
          }}
        >
          Reset
        </Button>
      </Box>
      <webview
        ref={ref}
        style={{
          width: '100%',
          height: '100%',
        }}
        partition={partition}
        src={props.src}
      ></webview>
    </Box>
  );
};
