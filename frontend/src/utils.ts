import { ethers } from "ethers";
import { Web3Provider } from "@ethersproject/providers";

const getWeb3 = (): Promise<Web3Provider> =>
  new Promise((resolve, reject) => {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    window.addEventListener("load", async () => {
      // Modern dapp browsers...
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        try {
          // Request account access if needed
          // Accounts now exposed
          resolve(provider);
        } catch (error) {
          reject(error);
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        // Use Mist/MetaMask's provider.
        const web3: Web3Provider = window.web3;
        console.log("Injected web3 detected.");
        resolve(web3);
      }
    });
  });

export default getWeb3;
