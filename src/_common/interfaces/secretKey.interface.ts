import { IMessage } from './message.interface';

export interface ISecretKey extends IMessage {
  secretKey: string;
}
