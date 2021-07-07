import { ethers } from 'ethers';

export interface Providers {
  web3Provider?: ethers.providers.Web3Provider,
  websocketProvider?: ethers.providers.WebSocketProvider,
};

export interface Block {
  blockNumber: number,
  timestamp: Date,
}

export interface EthereumData<T> extends Providers {
  address?: string,
  block: Block,
  data?: T,
};

export interface LogData extends Providers {
  setError: (error: string) => void,
  setConfirmation: (confirmation: string) => void,
};

export interface Contracts {
  usdc: ethers.Contract,
  dataAccessToken: ethers.Contract,
  dataProviderToken: ethers.Contract,
};

export interface ProvideTransaction {
  recordCount: number,
  timestamp: number,
  senderAddress: string,
}

export interface SignedTransaction {
  provideTransaction: ProvideTransaction,
  signature: string
}

export interface Record {
  age: number,
  weight: number,
  height: number,
}