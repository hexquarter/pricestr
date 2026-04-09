import { Request, Response, Router } from 'express';
import { config } from '../common/config.js';
import { createInvoice, watchPayment } from './wallet.js';
import { tierSubscriber } from '../common/subscriberCache.js';
import { queryAddInvoice, queryGetSubscriber } from '../common/db.js';
import { bech32 } from '@scure/base';
import { bytesToHex } from '@noble/hashes/utils.js';

export const paymentRouter = Router();

// ── POST /subscribe ───────────────────────────────────────────────────────────
// Creates invoice. Activates pubkey on settlement.
paymentRouter.post('/subscribe/:npub', async (req: Request, res: Response): Promise<void | Response> => {
    const { npub } = req.params as { npub: string };
    if (!npub) {
        return res.status(400).json({ error: 'npub required' });
    }

    let pubkey: string;
    try {
        const decoded = bech32.decodeToBytes(npub);
        if (decoded.prefix !== 'npub') {
            return res.status(400).json({ error: 'invalid npub prefix' });
        }
        pubkey = bytesToHex(bech32.fromWords(decoded.words));
    } catch (err) {
        return res.status(400).json({ error: 'invalid npub format' });
    }

    // Already active at this tier or higher.
    const currentTier = tierSubscriber(pubkey);
    if (currentTier === 'fast') {
        return res.json({ status: 'already_active', tier: currentTier });
    }

    const amountSat = config.fastTierSats
    const subExpiresAt = Date.now() + config.subDurationDays * 86400 * 1000;
    const expiryInvoiceSec = 3600;
    const expireInvoiceAt = Date.now() + (expiryInvoiceSec * 1000);

    // Fast tier — create invoice and start watching for payment.
    let invoiceDetails: { id: string, invoice: string, paymentHash: string };
    try {
        invoiceDetails = await createInvoice(amountSat, `PriceStr fast tier ${config.subDurationDays}d`, expiryInvoiceSec);
    } catch (err) {
        console.error('[payment] create invoice:', err);
        return res.status(500).json({ error: 'failed to create invoice' });
    }

    queryAddInvoice(invoiceDetails.invoice, pubkey, amountSat, expireInvoiceAt);
    watchPayment(invoiceDetails, pubkey, subExpiresAt, expiryInvoiceSec);

    res.json({
        status: 'pending',
        invoiceDetails,
        amount_sat: amountSat,
        expires_at: new Date(expireInvoiceAt).toISOString(),
    });
});

paymentRouter.get('/subscription/:pubkey', (req: Request<{ pubkey: string }>, res: Response): void | Response => {
    const { pubkey } = req.params;
    if (!pubkey) return res.status(400).json({ error: 'pubkey required' });

    const sub = queryGetSubscriber(pubkey);
    if (!sub) return res.json({ active: false });

    res.json({
        active: true,
        tier: sub.tier,
        expires_at: new Date(sub.expires_at * 1000).toISOString(),
    });
});