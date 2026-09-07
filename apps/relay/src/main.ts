import express, { Request, Response } from 'express';
import cors from 'cors'
import helmet from 'helmet';

import { createRelay, attachWebSocket } from './relay/index.js';
import { startOracle } from './oracle/index.js';
import { config } from './common/config.js';
import { posthog } from './common/posthog.js';

const app = express();
app.set('trust proxy', 1)
app.use(helmet())
app.use(cors());

// ── NIP-11 relay info ─────────────────────────────────────────────────────────
app.get('/', (_req: Request, res: Response): void | Response => {
    return res.json({
        name: config.relayName,
        description: config.relayDesc,
        pubkey: config.relayPubkey,
        supported_nips: [1]
    });
});

const server = app.listen(config.port, async () => {
    console.log(`PriceStr listening on :${config.port}`);
    console.log(`  Relay ws://localhost:${config.port}`);
    console.log(`  NIP-11 http://localhost:${config.port}/`);
    console.log(`  Subscribe to POST http://localhost:${config.port}/subscribe`);

    // ── Startup ───────────────────────────────────────────────────────────────────
    try {
        // ── Nostr relay (WebSocket) ───────────────────────────────────────────────────
        const relay = await createRelay();
        attachWebSocket(server, relay);
        await startOracle(relay);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
process.on('SIGINT', async () => { server.close(); await posthog.shutdown(); process.exit(0); });
process.on('SIGTERM', async () => { server.close(); await posthog.shutdown(); process.exit(0); });