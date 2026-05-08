import { NostrRelay } from '@nostr-relay/core';
import { createOutgoingNoticeMessage, Event, EventRepository } from '@nostr-relay/common';
import { WebSocketServer } from 'ws';
import { EventRepositorySqlite } from '@nostr-relay/event-repository-sqlite/dist/event-repository-sqlite.js';
import { db } from '../common/db.js';
import { Validator } from '@nostr-relay/validator';
import { PolicyPlugin } from './policy.js';
import { PremiumPlugin } from './premium.js';

export class PriceStrRelay extends NostrRelay {
    private eventRepository: EventRepository;

    constructor(eventRepository: EventRepository) {
        super(eventRepository);
        this.eventRepository = eventRepository;
        this.register(new PolicyPlugin());
        this.register(new PremiumPlugin())
    }

    async registerEvent(event: Event) {
        return this.eventRepository.upsert(event);
    }
}

export const createRelay = async (): Promise<PriceStrRelay> => {
    const eventRepository = new EventRepositorySqlite(db);
    await eventRepository.init();
    return new PriceStrRelay(eventRepository);
}

export function attachWebSocket(server: any, relay: NostrRelay) {
    const wss = new WebSocketServer({ server, path: '/' });
    const validator = new Validator();

    wss.on('connection', ws => {
        relay.handleConnection(ws);

        ws.on('message', async data => {
            try {
                const message = await validator.validateIncomingMessage(data);
                await relay.handleMessage(ws, message);
            } catch (err) {
                if (err instanceof Error) {
                    ws.send(JSON.stringify(createOutgoingNoticeMessage(err.message)));
                }
            }
        });

        ws.on('close', () => relay.handleDisconnect(ws));
        ws.on('error', err => {
            ws.send(JSON.stringify(createOutgoingNoticeMessage(err.message)));
        });
    });

    console.log('Nostr relay ready at wss://[host]');
}