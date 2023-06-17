import React from 'react';
import { Box, Button } from '@chakra-ui/react';

interface WebviewTag extends HTMLWebViewElement {
  reload: () => void;
}

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
  return (
    <Box width={'100%'}>
      <Box className='controller-bar'>
        <Button
          onClick={() => {
            if (ref.current) {
              ref.current.reload();
            }
          }}
        >
          刷新
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
