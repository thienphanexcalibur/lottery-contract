import { use } from "chai";
import { task } from "hardhat/config";
import type { HardhatUserConfig } from "hardhat/config";

import chaiAsPromise from "chai-as-promised";
use(chaiAsPromise);

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
  solidity: "0.8.7",
  networks: {
    hardhat: {
      accounts: {
        mnemonic:
          "slow menu plunge actress table best grit eye unique auto option hover",
      },
    },
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 1000,
    },
  },
};

module.exports = config;
