import { config } from '../common/config.js';
import { hasFastSubscribers } from '../common/subscriberCache.js';
import { PriceStrRelay } from '../relay/index.js';
import { publishSlowTick, publishFastTick } from './publisher.js';

let slowTimer: NodeJS.Timeout | null = null;
let fastTimer: NodeJS.Timeout | null = null;

export function startOracle(relay: PriceStrRelay) {
  // Publish immediately on start, then on interval.
  publishSlowTick(relay);

  slowTimer = setInterval(() => publishSlowTick(relay), config.slowPollMs);

  fastTimer = setInterval(() => {
    // Fast loop only runs when paid subscribers are connected.
    if (hasFastSubscribers()) {
      publishFastTick(relay);
    }
  }, config.fastPollMs);

  console.log(`[oracle] started — slow=${config.slowPollMs}ms fast=${config.fastPollMs}ms`);
}

export function stopOracle() {
  slowTimer?.close();
  fastTimer?.close();
}