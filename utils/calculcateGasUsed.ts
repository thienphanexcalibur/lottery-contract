import type { TransactionResponse } from "@ethersproject/abstract-provider";
import type { BigNumberish } from "ethers";

const calculateGasUsed = async (
  transaction: TransactionResponse
): Promise<BigNumberish> => {
  const receipt = await transaction.wait();
  const { gasUsed, effectiveGasPrice } = receipt;
  return gasUsed.mul(effectiveGasPrice);
};

export default calculateGasUsed;
