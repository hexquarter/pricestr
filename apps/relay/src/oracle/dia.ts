const ENDPOINT = 'https://api.diadata.org/v1/assetQuotation/Bitcoin/0x0000000000000000000000000000000000000000';

export async function getBitcoinDiaPrice() {
    const response = await fetch(ENDPOINT, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    const body = await response.json()
    return { price: Number(body['Price']), name: 'dia' };
}

