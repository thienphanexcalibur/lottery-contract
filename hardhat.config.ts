import { use } from "chai";
import { task } from "hardhat/config";
import type { HardhatUserConfig } from "hardhat/config";

import "@openzeppelin/hardhat-upgrades";
import "@nomiclabs/hardhat-ganache";

import '@typechain/hardhat'

import chaiAsPromise from "chai-as-promised";
use(chaiAsPromise);

// Import env
import "dotenv/config";

const { GOERLI_END_POINT, ALCHEMY_API_KEY, GOERLI_PRIVATE_KEY, TEST_MNEMONIC } =
  process.env;

import "@nomiclabs/hardhat-waffle";

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.7",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  networks: {
    hardhat: {
      accounts: {
        mnemonic: TEST_MNEMONIC,
      },
    },
    goerli: {
      url: `${GOERLI_END_POINT}/${ALCHEMY_API_KEY}`,
      accounts: [`${GOERLI_PRIVATE_KEY}`],
      gas: 2100000,
      gasPrice: 8000000000,
    },
  },
};

module.exports = config;
