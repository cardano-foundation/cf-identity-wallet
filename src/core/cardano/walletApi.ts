import { WalletApi as WalletApiProps } from "lucid-cardano";

class WalletApi implements WalletApiProps {
  account: {
    publicKeyBech32: string;
  };
  endpoint: string;
  constructor(
    account: {
      publicKeyBech32: string;
    },
    endpoint: string
  ) {
    this.account = account;
    this.endpoint = endpoint;
  }
  async getBalance(): Promise<string> {
    return Promise.resolve("");
  }

  getChangeAddress(): Promise<string> {
    return Promise.resolve("");
  }

  getCollateral(): Promise<string[]> {
    return Promise.resolve([]);
  }

  getNetworkId(): Promise<number> {
    return Promise.resolve(0);
  }

  getRewardAddresses(): Promise<string[]> {
    return Promise.resolve([]);
  }

  getUnusedAddresses(): Promise<string[]> {
    return Promise.resolve([]);
  }

  getUsedAddresses(): Promise<string[]> {
    return Promise.resolve([]);
  }

  getUtxos(): Promise<string[] | undefined> {
    return Promise.resolve(undefined);
  }

  signData(
    address: string,
    payload: string
  ): Promise<{ signature: string; key: string }> {
    return Promise.resolve({ key: "", signature: "" });
  }

  signTx(tx: string, partialSign: boolean): Promise<string> {
    return Promise.resolve("");
  }

  submitTx(tx: string): Promise<string> {
    return Promise.resolve("");
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  experimental: {
    getCollateral(): Promise<string[]>;
    on(eventName: string, callback: (...args: unknown[]) => void): void;
    off(eventName: string, callback: (...args: unknown[]) => void): void;
  };
}

export { WalletApi };
