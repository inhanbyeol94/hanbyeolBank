export interface IClientVerifyIdentity {
  name: string;
  code: string;
  hash: string;
  type: number;
  sequence: string;
  verify: boolean;
  clientVeify: boolean;
}
