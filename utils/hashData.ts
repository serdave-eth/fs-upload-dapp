import { utils } from "ethers-v5";

export const hashData = (data: Uint8Array) => {
  return utils.sha256(data).slice(2); // Remove the '0x' prefix
};    