# Run TanStack Start as SPA (SSR disabled)

We enable TanStack Start's built-in SPA mode via the Vite plugin: `tanstackStart({ spa: { enabled: true } })`. The app renders client-only: the server prerenders a static HTML shell (`/_shell`), React renders entirely on the client, and route loaders execute on the client during navigation.

## Why

The app has no SEO surface — every meaningful route is behind authentication (`_app/*`), and auth is already 100% client-side via `useAuthenticate()` from better-auth-ui. SSR therefore bought us nothing while introducing hydration mismatches, prefetch races, and double-fetch behavior that caused recurring bugs.

## Considered options

- **Keep SSR globally.** Rejected: hydration/prefetch bugs were the original complaint; the SEO/initial-paint upside doesn't apply to an authed-only product.
- **Disable SSR per-route.** Rejected: mixing render modes within one router multiplies failure modes and complicates reasoning. A single global switch is simpler.
- **Strip the Nitro server entirely (full static SPA).** Rejected: oRPC handler and Better Auth both require a server runtime. Keeping the server entry while disabling React SSR is the lower-cost path.

## Consequences

- `setupRouterSsrQueryIntegration` is kept. Its server branch is dormant without SSR; its client branch still wires `handleRedirects` on the mutation/query caches, which we rely on.
- Loaders still run (client-side) and still call `ensureQueryData` to block navigation until data is ready — UX is unchanged, only the render boundary moves.
- Components may now freely reference `window`/browser-only APIs without SSR guards.
- If SEO or public marketing routes appear later, this decision must be revisited.
