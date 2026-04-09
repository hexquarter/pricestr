import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors'
import { createRelay, attachWebSocket } from './relay/index.js';
import { startOracle } from './oracle/index.js';
import { initWallet } from './payment/wallet.js';
import { paymentRouter } from './payment/routes.js';
import { config } from './common/config.js';
import { evictExpiredSubscribers } from './common/subscriberCache.js';
import { evictExpiredInvoices } from './common/db.js';

const app = express();
app.use(express.json());
app.use(cors())

// ── NIP-11 relay info ─────────────────────────────────────────────────────────
app.get('/', (req: Request, res: Response, next: NextFunction): void | Response => {
    if (req.headers.accept === 'application/nostr+json') {
        return res.json({
            name: config.relayName,
            description: config.relayDesc,
            pubkey: config.relayPubkey,
            supported_nips: [1, 42],
        });
    }
    next();
});

// ── Payment HTTP routes ───────────────────────────────────────────────────────
app.use(paymentRouter);

// ── Housekeeping ──────────────────────────────────────────────────────────────
setInterval(() => {
    evictExpiredSubscribers();
    evictExpiredInvoices()
}, 10 * 60 * 1000);

const server = app.listen(config.port, async () => {
    console.log(`PriceStr listening on :${config.port}`);
    console.log(`  relay ws://localhost:${config.port}`);
    console.log(`  NIP-11 http://localhost:${config.port}/`);
    console.log(`  subscribe POST http://localhost:${config.port}/subscribe`);

    // ── Nostr relay (WebSocket) ───────────────────────────────────────────────────
    const relay = await createRelay();
    attachWebSocket(server, relay);

    startOracle(relay);

    // ── Startup ───────────────────────────────────────────────────────────────────
    try {
        await initWallet();
    } catch (err) {
        console.error('[breez] init failed:', err);
        process.exit(1);
    }
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
process.on('SIGINT', () => { server.close(); process.exit(0); });
process.on('SIGTERM', () => { server.close(); process.exit(0); });