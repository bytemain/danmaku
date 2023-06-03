export interface DanmakuClientOptions {
  appKey: string;
  secret: string;
  roomId: number;
}

export class DanmakuClient {
  constructor(options: DanmakuClientOptions);
  start(): Promise<void>;
}
