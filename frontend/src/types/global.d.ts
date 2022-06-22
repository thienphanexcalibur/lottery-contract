import { Web3Provider } from "@ethersproject/providers";
global {
  interface Window {
    ethereum: Web3Provider;
    web3: Web3Provider;
  }
}

type Nullable<T> = T | null;
