import React from 'react';
import { Box, Button, Input } from '@chakra-ui/react';

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

interface WebviewTag extends HTMLWebViewElement {
  // Docs: https://electronjs.org/docs/api/webview-tag

  /**
   * Whether the guest page can go back.
   */
  canGoBack(): boolean;
  /**
   * Whether the guest page can go forward.
   */
  canGoForward(): boolean;
  /**
   * Whether the guest page can go to `offset`.
   */
  canGoToOffset(offset: number): boolean;

  /**
   * Clears the navigation history.
   */
  clearHistory(): void;
  /**
   * Closes the DevTools window of guest page.
   */
  closeDevTools(): void;
  /**
   * Executes editing command `copy` in page.
   */
  copy(): void;
  /**
   * Executes editing command `cut` in page.
   */
  cut(): void;
  /**
   * Executes editing command `delete` in page.
   */
  delete(): void;
  /**
   * Initiates a download of the resource at `url` without navigating.
   */
  downloadURL(url: string): void;
  /**
   * The title of guest page.
   */
  getTitle(): string;
  /**
   * The URL of guest page.
   */
  getURL(): string;
  /**
   * The user agent for guest page.
   */
  getUserAgent(): string;
  /**
   * The WebContents ID of this `webview`.
   */
  getWebContentsId(): number;
  /**
   * the current zoom factor.
   */
  getZoomFactor(): number;
  /**
   * the current zoom level.
   */
  getZoomLevel(): number;
  /**
   * Makes the guest page go back.
   */
  goBack(): void;
  /**
   * Makes the guest page go forward.
   */
  goForward(): void;
  /**
   * Navigates to the specified absolute index.
   */
  goToIndex(index: number): void;
  /**
   * Navigates to the specified offset from the "current entry".
   */
  goToOffset(offset: number): void;
  /**
   * A promise that resolves with a key for the inserted CSS that can later be used
   * to remove the CSS via `<webview>.removeInsertedCSS(key)`.
   *
   * Injects CSS into the current web page and returns a unique key for the inserted
   * stylesheet.
   */
  insertCSS(css: string): Promise<string>;
  /**
   * Inserts `text` to the focused element.
   */
  insertText(text: string): Promise<void>;
  /**
   * Starts inspecting element at position (`x`, `y`) of guest page.
   */
  inspectElement(x: number, y: number): void;
  /**
   * Opens the DevTools for the service worker context present in the guest page.
   */
  inspectServiceWorker(): void;
  /**
   * Opens the DevTools for the shared worker context present in the guest page.
   */
  inspectSharedWorker(): void;
  /**
   * Whether guest page has been muted.
   */
  isAudioMuted(): boolean;
  /**
   * Whether the renderer process has crashed.
   */
  isCrashed(): boolean;
  /**
   * Whether audio is currently playing.
   */
  isCurrentlyAudible(): boolean;
  /**
   * Whether DevTools window of guest page is focused.
   */
  isDevToolsFocused(): boolean;
  /**
   * Whether guest page has a DevTools window attached.
   */
  isDevToolsOpened(): boolean;
  /**
   * Whether guest page is still loading resources.
   */
  isLoading(): boolean;
  /**
   * Whether the main frame (and not just iframes or frames within it) is still
   * loading.
   */
  isLoadingMainFrame(): boolean;
  /**
   * Whether the guest page is waiting for a first-response for the main resource of
   * the page.
   */
  isWaitingForResponse(): boolean;
  /**
   * The promise will resolve when the page has finished loading (see
   * `did-finish-load`), and rejects if the page fails to load (see `did-fail-load`).
   *
   * Loads the `url` in the webview, the `url` must contain the protocol prefix, e.g.
   * the `http://` or `file://`.
   */
  loadURL(url: string, options?: LoadURLOptions): Promise<void>;
  /**
   * Opens a DevTools window for guest page.
   */
  openDevTools(): void;
  /**
   * Executes editing command `paste` in page.
   */
  paste(): void;
  /**
   * Executes editing command `pasteAndMatchStyle` in page.
   */
  pasteAndMatchStyle(): void;

  /**
   * Executes editing command `redo` in page.
   */
  redo(): void;
  /**
   * Reloads the guest page.
   */
  reload(): void;
  /**
   * Reloads the guest page and ignores cache.
   */
  reloadIgnoringCache(): void;
  /**
   * Resolves if the removal was successful.
   *
   * Removes the inserted CSS from the current web page. The stylesheet is identified
   * by its key, which is returned from `<webview>.insertCSS(css)`.
   */
  removeInsertedCSS(key: string): Promise<void>;
  /**
   * Executes editing command `replace` in page.
   */
  replace(text: string): void;
  /**
   * Executes editing command `replaceMisspelling` in page.
   */
  replaceMisspelling(text: string): void;
  /**
   * Executes editing command `selectAll` in page.
   */
  selectAll(): void;
  /**
   * Send an asynchronous message to renderer process via `channel`, you can also
   * send arbitrary arguments. The renderer process can handle the message by
   * listening to the `channel` event with the `ipcRenderer` module.
   *
   * See webContents.send for examples.
   */
  send(channel: string, ...args: any[]): Promise<void>;

  /**
   * Send an asynchronous message to renderer process via `channel`, you can also
   * send arbitrary arguments. The renderer process can handle the message by
   * listening to the `channel` event with the `ipcRenderer` module.
   *
   * See webContents.sendToFrame for examples.
   */
  sendToFrame(
    frameId: [number, number],
    channel: string,
    ...args: any[]
  ): Promise<void>;
  /**
   * Set guest page muted.
   */
  setAudioMuted(muted: boolean): void;
  /**
   * Overrides the user agent for the guest page.
   */
  setUserAgent(userAgent: string): void;
  /**
   * Sets the maximum and minimum pinch-to-zoom level.
   */
  setVisualZoomLevelLimits(
    minimumLevel: number,
    maximumLevel: number
  ): Promise<void>;
  /**
   * Changes the zoom factor to the specified factor. Zoom factor is zoom percent
   * divided by 100, so 300% = 3.0.
   */
  setZoomFactor(factor: number): void;
  /**
   * Changes the zoom level to the specified level. The original size is 0 and each
   * increment above or below represents zooming 20% larger or smaller to default
   * limits of 300% and 50% of original size, respectively. The formula for this is
   * `scale := 1.2 ^ level`.
   *
   * > **NOTE**: The zoom policy at the Chromium level is same-origin, meaning that
   * the zoom level for a specific domain propagates across all instances of windows
   * with the same domain. Differentiating the window URLs will make zoom work
   * per-window.
   */
  setZoomLevel(level: number): void;
  /**
   * Shows pop-up dictionary that searches the selected word on the page.
   *
   * @platform darwin
   */
  showDefinitionForSelection(): void;
  /**
   * Stops any pending navigation.
   */
  stop(): void;
  /**
   * Stops any `findInPage` request for the `webview` with the provided `action`.
   */
  stopFindInPage(
    action: 'clearSelection' | 'keepSelection' | 'activateSelection'
  ): void;
  /**
   * Executes editing command `undo` in page.
   */
  undo(): void;
  /**
   * Executes editing command `unselect` in page.
   */
  unselect(): void;
  /**
   * A `boolean`. When this attribute is present the guest page will be allowed to
   * open new windows. Popups are disabled by default.
   */
  allowpopups: boolean;
  /**
   * A `string` which is a list of strings which specifies the blink features to be
   * disabled separated by `,`. The full list of supported feature strings can be
   * found in the RuntimeEnabledFeatures.json5 file.
   */
  disableblinkfeatures: string;
  /**
   * A `boolean`. When this attribute is present the guest page will have web
   * security disabled. Web security is enabled by default.
   */
  disablewebsecurity: boolean;
  /**
   * A `string` which is a list of strings which specifies the blink features to be
   * enabled separated by `,`. The full list of supported feature strings can be
   * found in the RuntimeEnabledFeatures.json5 file.
   */
  enableblinkfeatures: string;
  /**
   * A `string` that sets the referrer URL for the guest page.
   */
  httpreferrer: string;
  /**
   * A `boolean`. When this attribute is present the guest page in `webview` will
   * have node integration and can use node APIs like `require` and `process` to
   * access low level system resources. Node integration is disabled by default in
   * the guest page.
   */
  nodeintegration: boolean;
  /**
   * A `boolean` for the experimental option for enabling NodeJS support in
   * sub-frames such as iframes inside the `webview`. All your preloads will load for
   * every iframe, you can use `process.isMainFrame` to determine if you are in the
   * main frame or not. This option is disabled by default in the guest page.
   */
  nodeintegrationinsubframes: boolean;
  /**
   * A `string` that sets the session used by the page. If `partition` starts with
   * `persist:`, the page will use a persistent session available to all pages in the
   * app with the same `partition`. if there is no `persist:` prefix, the page will
   * use an in-memory session. By assigning the same `partition`, multiple pages can
   * share the same session. If the `partition` is unset then default session of the
   * app will be used.
   *
   * This value can only be modified before the first navigation, since the session
   * of an active renderer process cannot change. Subsequent attempts to modify the
   * value will fail with a DOM exception.
   */
  partition: string;
  /**
   * A `boolean`. When this attribute is present the guest page in `webview` will be
   * able to use browser plugins. Plugins are disabled by default.
   */
  plugins: boolean;
  /**
   * A `string` that specifies a script that will be loaded before other scripts run
   * in the guest page. The protocol of script's URL must be `file:` (even when using
   * `asar:` archives) because it will be loaded by Node's `require` under the hood,
   * which treats `asar:` archives as virtual directories.
   *
   * When the guest page doesn't have node integration this script will still have
   * access to all Node APIs, but global objects injected by Node will be deleted
   * after this script has finished executing.
   */
  preload: string;
  /**
   * A `string` representing the visible URL. Writing to this attribute initiates
   * top-level navigation.
   *
   * Assigning `src` its own value will reload the current page.
   *
   * The `src` attribute can also accept data URLs, such as `data:text/plain,Hello,
   * world!`.
   */
  src: string;
  /**
   * A `string` that sets the user agent for the guest page before the page is
   * navigated to. Once the page is loaded, use the `setUserAgent` method to change
   * the user agent.
   */
  useragent: string;
  /**
   * A `string` which is a comma separated list of strings which specifies the web
   * preferences to be set on the webview. The full list of supported preference
   * strings can be found in BrowserWindow.
   *
   * The string follows the same format as the features string in `window.open`. A
   * name by itself is given a `true` boolean value. A preference can be set to
   * another value by including an `=`, followed by the value. Special values `yes`
   * and `1` are interpreted as `true`, while `no` and `0` are interpreted as
   * `false`.
   */
  webpreferences: string;
}

interface LoadURLOptions {
  whatever: string;
}
