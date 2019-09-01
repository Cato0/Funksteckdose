// https://github.com/wavesplatform/waves-data-oracle/blob/master/src/app/services/KeeperService.ts

declare const Waves: IWavesKeeperOptions;

interface IWavesKeeperOptions {
    auth: (authData: { data: string }) => Promise<AuthResult>
    signTransaction: (transaction: { type: number, data: any}) => Promise<string>;
    signAndPublishTransaction: (transaction: { type: number, data: any}) => Promise<string>;
}

interface AuthResult {
    address: string;​
    host: string;
    prefix: string;
    publicKey: string;
    signature: string;
    version: number;
}