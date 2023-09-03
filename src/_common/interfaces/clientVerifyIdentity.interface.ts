export interface IClientVerifyIdentity {
  name: string;
  code: string;
  hash: string;
  type: number;
  sequence: number;
  verify: boolean;
  clientVeify: boolean;
}
