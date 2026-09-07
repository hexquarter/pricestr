import { BeforeHandleEventPlugin, Event, BeforeHandleEventResult } from '@nostr-relay/common';
import { config } from '../common/config.js';

export class PolicyPlugin implements BeforeHandleEventPlugin {
  beforeHandleEvent(_event: Event): Promise<BeforeHandleEventResult> | BeforeHandleEventResult {
    if (_event.pubkey !== config.relayPubkey) {
      return {
        canHandle: false,
          message: 'restricted: read-only relay',
      };
    }

    return { canHandle: true }
  }
}