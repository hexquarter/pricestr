export async function getHyperliquidSpotPrice(): Promise<{ name: string, price: number }> {
    const pairName = await getSpotMeta()

    const response = await fetch('https://api.hyperliquid.xyz/info', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: "allMids" })
    })

    const mids = await response.json()
    const spot = mids[pairName]
    // const perp = mids['BTC']

    return {
        name: "hyperliquid",
        price: parseFloat(spot)
        
    }
}

async function getSpotMeta() {
    const response = await fetch('https://api.hyperliquid.xyz/info', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: "spotMeta" })
    })
    const meta = await response.json()
    const usdc = meta.tokens.find((t: any) => t.name === "USDC");
    const btc = meta.tokens.find((t: any) => t.name === "UBTC"); // HyperCore uses UBTC

    const pair = meta.universe.find((p: any) =>
        p.tokens[0] === btc.index &&
        p.tokens[1] === usdc.index
    );


    return pair.name
}

export async function getHyperliquidBookPrice() {
    const response = await fetch('https://api.hyperliquid.xyz/info', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: "l2Book" })
    })
    const body = await response.json()
    return { price: Number(body['BTC']), name: 'hyperliquid' };
}

