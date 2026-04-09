import { BeforeHandleEventPlugin, Event, BeforeHandleEventResult } from '@nostr-relay/common';

export class PolicyPlugin implements BeforeHandleEventPlugin {
  beforeHandleEvent(_event: Event): Promise<BeforeHandleEventResult> | BeforeHandleEventResult {
    return {
      canHandle: false,
        message: 'restricted: read-only relay',
    };
  }
}