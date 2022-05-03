import { expect } from "chai";
import type { BigNumber, Contract, Signer } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { parseEther } from "ethers/lib/utils";

const { utils, getSigner } = ethers;

const GAS_LIMIT = 300000;

const participate = async ({
  to,
  value,
  from,
}: {
  from: SignerWithAddress;
  value: BigNumber;
  to: string;
}) =>
  from.sendTransaction({
    value,
    gasLimit: GAS_LIMIT,
    to,
  });

describe("Lottery", async function () {
  let lottery: Contract;

  before(async () => {
    const Lottery = await ethers.getContractFactory("Lottery");
    lottery = await Lottery.deploy();

    await lottery.deployed();
  });

  it("should deploy properly with correct owner", async function () {
    const [owner] = await ethers.getSigners();

    const contractOwner = await lottery.owner();

    expect(contractOwner).to.equal(owner.address);
  });

  it("should be participate in the lottery", async function () {
    const [owner, ...accountAddresses] = await ethers.getSigners();

    const randomizeEtherAmount = () => parseEther(`${Math.random() * 10}`);

    for (const account of accountAddresses) {
      const tx = await participate({
        from: account,
        value: randomizeEtherAmount(),
        to: lottery.address,
      });
      expect(tx.blockHash).to.be.not.null;
    }
  });

  it("should be able to block user from re-entrance", async function () {
    const [, address1] = await ethers.getSigners();
    await expect(
      address1.sendTransaction({
        value: utils.parseEther("0.1"),
        gasLimit: GAS_LIMIT,
        to: lottery.address,
      })
    ).to.be.revertedWith("Player has entered");
  });

  it("should only the owner can pick the winner", async function () {
    const [, address1] = await ethers.getSigners();
    await expect(lottery.connect(address1).pickWinner()).to.be.reverted;
  });

  it("should be able to pick the participated winner", async function () {
    const contractBalance = await lottery.provider.getBalance(lottery.address);
    const tx = await lottery.pickWinner();
    await tx.wait();
    const winnerAddress = await lottery.winnerAddress();
    await expect(tx)
      .to.emit(lottery, "PICK_WINNER")
      .withArgs(winnerAddress)
      .to.emit(lottery, "TRANSFERED_WINNER_PRIZE")
      .withArgs(winnerAddress, contractBalance.toString());
  });
});
