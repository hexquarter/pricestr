import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider(
  "https://ethereum-rpc.publicnode.com"
);

const abi = [
  "function latestRoundData() view returns (uint80,int256,uint256,uint256,uint80)",
  "function decimals() view returns (uint8)"
];

const address = "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c";

const feed = new ethers.Contract(address, abi, provider);

export async function getChainLinkBTCPriceFeed() {
  const [, answer] = await feed.latestRoundData();
  const decimals = await feed.decimals();

  const price = BigInt(answer) / 10n ** decimals;
  return { price: Number(price), name: 'chainlink' };
}