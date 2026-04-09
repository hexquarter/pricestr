import { config } from '../common/config.js';
import { evictExpiredInvoices, queryMarkInvoicePaid } from '../common/db.js';
import { addSubscriber } from '../common/subscriberCache.js';
import { SparkWallet } from '@buildonspark/spark-sdk';

let _wallet: SparkWallet | null = null;

export const initWallet = async () => {
    await getFreshWallet()
    console.log('Spark Wallet initialized')
}

const getFreshWallet = async (): Promise<SparkWallet> => {
    if (_wallet) return _wallet;

    if (_wallet) {
        return _wallet;
    }
    const { wallet } = await SparkWallet.initialize({
        mnemonicOrSeed: config.sparkMnemonic,
        options: {
            network: 'MAINNET'
        }
    });
    _wallet = wallet

    return wallet
}

const withWallet = async <T>(fn: (wallet: SparkWallet) => Promise<T>): Promise<T> => {
    try {
        const wallet = await getFreshWallet()
        return await fn(wallet)
    } catch (err: any) {
        if (err?.message?.includes('Channel has been shut down')) {
            console.warn('♻️ Reinitializing Spark wallet...')

            _wallet = null
            const wallet = await getFreshWallet()

            return await fn(wallet)
        }
        throw err
    }
}

type InvoiceDetails = { id: string, invoice: string, paymentHash: string}

export async function createInvoice(amountSat: number, description: string, expirySeconds: number): Promise<InvoiceDetails> {
    return withWallet(async (wallet) => {
        const pubkey = await wallet.getIdentityPublicKey()
        const invoiceRequest = await wallet.createLightningInvoice({
            amountSats: amountSat,
            receiverIdentityPubkey: pubkey,
            memo: description,
            expirySeconds
        })

        return { 
            id: invoiceRequest.id, 
            invoice: invoiceRequest.invoice.encodedInvoice,
            paymentHash: invoiceRequest.invoice.paymentHash
        }
    })
}

export const watchPayment = async (invoiceDetails: InvoiceDetails, pubkey: string, subExpiresAt: number, invoiceExpireSec: number) => {
    withWallet(async (wallet) => {
        const listener = async (transferId: string) => {
            const transfer = await wallet.getTransfer(transferId)
            if (transfer?.transferDirection == 'INCOMING' && transfer.id == invoiceDetails.id) {
                queryMarkInvoicePaid(invoiceDetails.invoice);
                addSubscriber(pubkey, 'fast', subExpiresAt);
                console.log(`[payment] activated pubkey=${pubkey.slice(0, 8)} tier=fast`);
                wallet.off('transfer:claimed', listener)
            }
        }
        wallet.once("transfer:claimed", listener);

        setTimeout(() => {
            wallet.off('transfer:claimed', listener)
            evictExpiredInvoices()
        }, invoiceExpireSec * 1000)
    })
}