import { config } from '../common/config.js';
import { PriceStrRelay } from '../relay/index.js';
import { publishTick } from './publisher.js';

let timer: NodeJS.Timeout | null = null;

export async function startOracle(relay: PriceStrRelay) {
  // Publish immediately on start, then on interval.
  await publishTick(relay);

  timer = setInterval(() => publishTick(relay), config.pollMs);
  console.log(`[oracle] started — tick each ${config.pollMs}ms`);
}

export function stopOracle() {
  timer?.close();
}

