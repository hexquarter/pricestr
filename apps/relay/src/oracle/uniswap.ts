import { JsonRpcProvider, Contract } from "ethers";
import { Token } from "@uniswap/sdk-core";
import { PoolKey, Pool } from "@uniswap/v4-sdk";

/**
 * RPC
 */
const provider = new JsonRpcProvider("https://ethereum-rpc.publicnode.com");

/**
 * StateView (mainnet)
 * This is the canonical v4 read contract
 */
const STATE_VIEW =
    "0x7ffe42c4a5deea5b0fec41c94c136cf115597227";

/**
 * ABI (minimal)
 */
const stateView = new Contract(
    STATE_VIEW,
    [
        "function getSlot0(bytes32 poolId) view returns (uint160 sqrtPriceX96,int24 tick,uint24 protocolFee,uint24 lpFee)",
        "function getLiquidity(bytes32 poolId) view returns (uint128 liquidity)"
    ],
    provider
);

/**
 * Tokens
 */
const WBTC = new Token(
    1,
    "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599".toLowerCase(),
    8,
    "WBTC"
);

const USDC = new Token(
    1,
    "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48".toLowerCase(),
    6,
    "USDC"
);

/**
 * Pool definition (v4 SDK)
 */
const poolKey: PoolKey = {
    currency0: WBTC.address,
    currency1: USDC.address,
    fee: 3000,
    tickSpacing: 60,
    hooks: "0x0000000000000000000000000000000000000000"
};

export async function getUniswapV4WBTCPrice(): Promise<{ name: string, price: number }> {
    // derive PoolId using SDK
    const poolId = Pool.getPoolId(WBTC, USDC, poolKey.fee, poolKey.tickSpacing, poolKey.hooks);

    // fetch state
    const [slot0, _liquidity] = await Promise.all([
        stateView.getSlot0(poolId),
        stateView.getLiquidity(poolId)
    ]);
    const sqrtPriceX96 = BigInt(slot0.sqrtPriceX96);
    const Q192 = 2n ** 192n;
    const priceX192 = (sqrtPriceX96 * sqrtPriceX96) / Q192;
    const rawPrice = Number(priceX192);


    /**
     * decimal correction (WBTC 8, USDC 6)
     */
    let price = rawPrice * 10 ** (8 - 6);

    /**
     * direction safety (token ordering)
     */
    const isToken0WBTC =
        poolKey.currency0.toLowerCase() ===
        WBTC.address.toLowerCase();

    if (!isToken0WBTC) {
        price = 1 / price;
    }

    return { price, name: 'uniswap' };
}