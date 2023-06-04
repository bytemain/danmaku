import { ENotificationType } from './packet';

export interface EMessageEventCommandPayload<T> {
  name: ENotificationType;
  data: T;
}

export interface DanmakuClientOptions {
  appKey: string;
  secret: string;
  roomId: number;
}

export enum EMessageEventType {
  POPULARITY = 'POPULARITY',
  COMMAND = 'COMMAND',
}
