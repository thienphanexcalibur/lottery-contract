import { Web3Provider } from "@ethersproject/providers";
import { useToast } from "@chakra-ui/react";
import { useState, useCallback, useEffect, useMemo } from "react";
import getWeb3 from "../utils";

interface ProviderRpcError extends Error {
  message: string;
  code: number;
  data?: unknown;
}

const useMetaMask = () => {
  const [provider, setProvider] = useState<Web3Provider>();

  const [account, setAccount] = useState<string>("");

  const toast = useToast();

  const getProvider = useCallback(async () => {
    const Web3Provider = await getWeb3();
    setProvider(Web3Provider);
    // const signer = Web3Provider.getSigner();
    // const LotteryContract = new ethers.Contract(
    //   "0x17AcFDad59451a07cf0C1921B2e6A898cdEb7755",
    //   LotteryABI.abi
    // );

    // const contract = LotteryContract.connect(signer);

    // console.log((await contract.getPrizePool()).toString());
  }, []);

  const getAccounts = useCallback(async () => {
    const accounts = await window.ethereum.request({
      method: "eth_accounts",
    });
    if (accounts?.length > 0) {
      setAccount(accounts[0]);
      toast({
        title: "Connected",
        status: "success",
        description: "Connected to Metamask Wallet",
      });
      return;
    }
    setAccount("");
    toast({
      title: "Disconnected",
      status: "error",
      description: "Please connect Metamask Wallet",
    });
  }, []);

  useEffect(() => {
    getProvider();
  }, [getProvider]);

  useEffect(() => {
    window.ethereum.on("accountsChanged", getAccounts);
  }, [getAccounts]);

  const connectWallet = useCallback(async () => {
    try {
      if (provider) {
        const accounts = await provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);
      }
    } catch (e) {
      const error = e as ProviderRpcError;
      toast({
        status: "error",
        title: error.code,
        description: error.message,
      });
    }
  }, [provider, toast]);

  const disconnectWallet = useCallback(async () => {
    try {
      await window.ethereum.request({ method: "eth_disconnectAccounts" });
    } catch (e) {
      const error = e as ProviderRpcError;
      toast({
        status: "error",
        title: error.code,
        description: error.message,
      });
    }
  }, []);

  return useMemo(
    () => ({ provider, connectWallet, account, disconnectWallet }),
    [provider, connectWallet, account, disconnectWallet]
  );
};

export default useMetaMask;
