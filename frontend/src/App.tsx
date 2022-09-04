import "./App.css";
import { Suspense, useCallback, useEffect, useState } from "react";

import LotteryABI from "../../artifacts/contracts/Lottery.sol/Lottery.json";

import {
  Badge,
  Box,
  Button,
  Center,
  Flex,
  HStack,
  Input,
  Table,
  Text,
  usePrevious,
  useToast,
  VStack,
} from "@chakra-ui/react";
import useMetaMask from "./hooks/useMetamask";
import { BigNumber, ethers } from "ethers";
import type { Lottery } from "../../typechain-types";
import useError from "./hooks/useError";

const CONTRACT_ADDRESS = "0xCE260453e485d57eF5E07533D7CFBc2E5F9fF0eB";

interface CommitHistory {
  amount: string;
}

interface WinnerHistory {
  amount: string;
  address: string;
}

const App = () => {
  const toast = useToast();

  useError();

  const { connectWallet, account, disconnectWallet, provider } = useMetaMask();

  const [contract, setContract] = useState<Lottery>();

  const [owner, setOwner] = useState<string>("");

  const prevAccount = usePrevious(account);

  const [prizePool, setPrizePool] = useState<string>("0");

  const [winner, setWinner] = useState<WinnerHistory>({
    amount: "",
    address: "",
  });

  const [commit, setCommit] = useState<string>("0");

  const [history, setHistory] = useState<CommitHistory[]>([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getLotteryContract = () => {
      // If the metamask didn't connected with any accounts,
      // create this contract with instance with provider argument
      // in read-only mode to the blockchain network
      // https://docs.ethers.io/v5/api/contract/contract/#Contract-connect
      const lotteryContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        LotteryABI.abi,
        provider
      ) as Lottery;

      lotteryContract.on("TRANSFERED_WINNER_PRIZE", (address, amount) => {
        setWinner({
          amount: ethers.utils.formatEther(amount),
          address,
        });
      });

      setContract(lotteryContract);
    };
    if (provider) {
      getLotteryContract();
    }
  }, [provider]);

  useEffect(() => {
    if (contract) {
      contract.queryFilter("COMMIT").then((events) => {
        console.log(events);
      });
    }
  }, [contract]);

  useEffect(() => {
    const getPrizePool = async () => {
      const data: BigNumber = await contract.getPrizePool();
      setPrizePool(ethers.utils.formatEther(data.toString()).toString());
    };
    const getOwner = async () => {
      const data: string = await contract.owner();
      setOwner(data);
    };

    const getCommitHistory = async () => {
      // Currently support only one entrance
      const data = await contract.getPlayer(account);
      setHistory([
        {
          amount: ethers.utils.formatEther(data.toString()).toString(),
        },
      ]);
    };
    try {
      if (contract) {
        getPrizePool();
        getOwner();
        if (account) {
          getCommitHistory();
        }
      }
    } catch (e: any) {
      toast({
        title: "Lottery",
        description: JSON.stringify(e.message),
        status: "error",
      });
    }
  }, [contract, account]);

  useEffect(() => {
    if (contract && prevAccount !== account && provider) {
      // Check if the account is connected then connect the contract instance to that account
      // Read/write blockchain mode
      // https://docs.ethers.io/v5/api/contract/contract/#Contract-connect
      setContract(contract.connect(provider?.getSigner(account)));
    }
  }, [account, contract, provider]);

  const handleCommitChange = useCallback((e) => {
    setCommit(e.target.value);
  }, []);

  const pickWinner = useCallback(async () => {
    if (contract) {
      setLoading(true);
      try {
        await contract.pickWinner();
        toast({
          title: "Lottery Winner Routlette Success",
          status: "success",
        });
      } catch (e) {
        toast({
          title: "Lottery Winner Roulette Error",
          description: e.data.message,
          status: "error",
        });
      }
      setLoading(false);
    }
  }, [contract]);

  const getWinner = useCallback(async () => {
    if (contract) {
      const address = contract.winner();
      setWinner(address);
    }
  }, [contract]);

  const handleSubmitCommit = useCallback(
    async (e) => {
      e.preventDefault();
      if (commit) {
        const value = ethers.utils.parseEther(commit).toString();
        // window.ethereum.request({
        //   method: "eth_sendTransaction",
        //   params: [
        //     {
        //       from: account,
        //       to: CONTRACT_ADDRESS,
        //       value: ethers.utils.parseEther(commit).toHexString(),
        //     },
        //   ],
        // });
        try {
          setLoading(true);
          const signer = provider?.getSigner(account);
          const tx = await signer?.sendTransaction({
            value,
            to: CONTRACT_ADDRESS,
          });
          await tx?.wait();
          toast({
            title: "Commit to Lottery Success",
            description: `Sent ${commit} ETH`,
            status: "success",
          });
        } catch (e) {
          toast({
            title: "Commit to Lottery Error",
            description: e.data.message,
            status: "error",
          });
        } finally {
          setLoading(false);
          setCommit("0");
        }
      }
    },
    [commit, provider]
  );

  return (
    <Center>
      <HStack>
        <VStack gap={5} alignItems="flex-start">
          {!account ? (
            <Button onClick={connectWallet}>Connect</Button>
          ) : (
            <Text>Address: {account}</Text>
          )}
          {owner.toLowerCase() === account && (
            <Flex flexShrink={0}>
              <Badge variant="solid" colorScheme="yellow" flexShrink={0}>
                Owner
              </Badge>
              {Number(prizePool) > 0 && (
                <Button
                  colorScheme="purple"
                  disabled={!contract}
                  onClick={pickWinner}
                >
                  Pick Winner
                </Button>
              )}
            </Flex>
          )}
          <Box as="form" onSubmit={handleSubmitCommit}>
            <VStack gap={3} alignItems="flex-start">
              <Box>
                <Text>Enter your commit:</Text>
                <Input
                  type="number"
                  variant="filled"
                  value={commit}
                  onChange={handleCommitChange}
                />
              </Box>
              <Input type="submit" hidden />
              <Button
                type="submit"
                disabled={!Number(commit)}
                title="Participate"
                colorScheme="teal"
                isLoading={loading}
              >
                Commit
              </Button>
            </VStack>
          </Box>
          <Text fontSize="2xl">History</Text>
          {history.map((item, index) => (
            <HStack gap={1} key={performance.now()}>
              <Text fontWeight="600" fontSize="small">
                Entry No.{index + 1}:
              </Text>
              <Box>{item.amount} ETH</Box>
            </HStack>
          ))}
          <Text fontSize="2xl">Winner</Text>
          <VStack alignItems="flex-start">
            <Text>Address: {winner.address}</Text>
            <Text>Amount: {winner.amount} ETH</Text>
          </VStack>
        </VStack>

        <Text fontWeight="500">Prize Pool: {prizePool} ETH</Text>
      </HStack>
    </Center>
  );
};

export default App;
