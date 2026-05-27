<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into Pricestr. PostHog is initialised in `src/main.tsx` with the EU host and the app is wrapped with `PostHogProvider`. Eleven business events are now captured across four files, covering the full subscription purchase funnel (modal → invoice → Lightning payment), Pro dashboard interactions (authentication, webhooks, live stream, renewals), and landing-page developer engagement. Users are identified by their Nostr `npub` at two points: on payment completion and on NIP-07 extension connect.

| Event | Description | File |
|---|---|---|
| `subscription_modal_opened` | User opens the Pro subscription modal from pricing | `src/components/PricingTiers.tsx` |
| `enterprise_contact_clicked` | User clicks the Enterprise "Contact us" CTA | `src/components/PricingTiers.tsx` |
| `subscription_invoice_requested` | User initiates a Lightning invoice request | `src/components/SubscribeProModal.tsx` |
| `subscription_payment_completed` | Lightning invoice paid, Pro access confirmed | `src/components/SubscribeProModal.tsx` |
| `dashboard_connected_extension` | User authenticates via NIP-07 browser extension | `src/pages/Dashboard.tsx` |
| `webhook_registered` | User registers a webhook URL | `src/pages/Dashboard.tsx` |
| `webhook_removed` | User removes a registered webhook | `src/pages/Dashboard.tsx` |
| `live_stream_started` | User starts the live price stream | `src/pages/Dashboard.tsx` |
| `live_stream_stopped` | User stops the live price stream | `src/pages/Dashboard.tsx` |
| `subscription_renewal_opened` | User opens the renewal modal | `src/pages/Dashboard.tsx` |
| `get_started_snippet_run` | User runs the free-tier live demo snippet | `src/components/GetStarted.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](/dashboard/708320)
- [Subscription conversion funnel](/insights/uHVUPdC8)
- [Subscriptions completed over time](/insights/v8l6wg5K)
- [Dashboard feature engagement](/insights/zrTnmBYl)
- [Dashboard authentication methods](/insights/Pzhy9cwi)
- [Landing page developer engagement](/insights/QakXd4mb)

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
