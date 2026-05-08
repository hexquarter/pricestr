import { ClientContext, HandleMessagePlugin, HandleMessageResult, IncomingMessage } from '@nostr-relay/common';
import { Filter, verifyEvent } from 'nostr-tools';
import { randomBytes } from '@noble/hashes/utils';

type Nip42ClientContext = ClientContext & { nip42Challenge?: string, authPubkey?: string }

export class PremiumPlugin implements HandleMessagePlugin {
  async handleMessage(ctx: Nip42ClientContext, message: IncomingMessage, next: () => Promise<HandleMessageResult>): Promise<HandleMessageResult> {
    if (message[0] === 'AUTH') {
      const authPubkey = this.handleAuth(ctx, message[1])
      if (authPubkey) {
        ctx.authPubkey = authPubkey
      }
      return;
    }

    const subId = message[1];
    const filters = message.slice(2) as Filter[];

    const wantsPremium = filters.some((f) => {
      if (f['#t'] && f['#t'].includes('pricestr/premium')) {
        return true
      }
      return false
    })

    // Free content → always allowed
    if (!wantsPremium) {
      return next();
    }

    if (!ctx.authPubkey) {
      ctx.sendMessage([
        'AUTH',
        ctx.nip42Challenge ??
        (ctx.nip42Challenge = randomBytes(16).toHex())
      ]);

      ctx.sendMessage([
        'CLOSED',
        subId as string,
        'auth-required'
      ]);

      return
    }

    if (!isSubscribed(ctx.authPubkey)) {
      console.log('no subscription')
      ctx.sendMessage([
        'CLOSED',
        subId as string,
        'restricted: you are not subscribed'
      ]);
      return;
    }

    return next();
  }

  private handleAuth(ctx: Nip42ClientContext, event: any) {
    // Validate kind
    if (event.kind !== 22242) {
      ctx.sendMessage(['OK', event.id, false, 'invalid: wrong kind']);
      return;
    }

    // Check created_at is within 10 minutes
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - event.created_at) > 600) {
      ctx.sendMessage(['OK', event.id, false, 'invalid: event too old'])
      return;
    }

    // Verify challenge tag
    const challengeTag = event.tags.find((t: string[]) => t[0] === 'challenge');
    if (!challengeTag || challengeTag[1] !== ctx.nip42Challenge) {
      console.log(challengeTag, ctx.nip42Challenge)
      ctx.sendMessage(['OK', event.id, false, 'invalid: wrong challenge']);
      return;
    }

    // Verify signature
    if (!verifyEvent(event)) {
      ctx.sendMessage(['OK', event.id, false, 'invalid: bad signature']);
      return;
    }

    // Auth success
    return event.pubkey;
  }
}


const isSubscribed = (key?: string) => {
  if (!key) return false
  return true
}