# Provider Integration Notes

These notes capture the patterns and conventions used in this repo so new providers can be added consistently.

## Where provider logic lives

- `providers/*.js` contains provider detection and IPv6 generation helpers.
- `app.js` wires providers into AAAA and A record flows via data-driven registries.
- `tests/*.js` contains simple Node assertions for provider utilities.

## Architecture

Provider detection in `app.js` uses three registry arrays:

- **`AAAA_PROVIDERS`** — 27 entries, each with `detect(ctx)` and `resolve(ctx, result, cb)`. The `processAAAAProviders(ctx)` loop iterates these and stops at the first match. This eliminates missing-return bugs by design.
- **`A_IP_PROVIDERS`** — 13 entries for IP-range detection in A-record responses. Each has `check(ip)` and a `tag` (string or function).
- **`A_HOSTNAME_PROVIDERS`** — 11 entries for hostname-based detection in A-record responses. Each has `check(hostname)` and a `tag`.

The `add_aaaa` switch statement sets flags on a `detected` object. Provider registry entries check these flags first (`ctx.detected.<name>`) before running auto-detection.

## Adding a new provider

### AAAA provider (synthesizes AAAA from CNAME/A)

1. Add `require('./providers/<name>')` at the top of `app.js`.
2. Add a `case '<name>'` in the switch (lines ~475-565) to set `detected.<name> = true`.
3. Add an entry to `AAAA_PROVIDERS`:
   ```js
   { name: '<name>',
     detect: (ctx) => ctx.detected.<name> || provider.check_for_<name>_hostname(ctx.last_hostname),
     resolve: (ctx, r, cb) => asyncDNSAndRespond(ctx, provider.get<v6>address) },
   ```
   Use the appropriate resolve helper: `resolve6AndRespond`, `asyncDNSAndRespond`, `staticV6AndRespond`, or `resolve4AndMapV6`.

### A-record IP provider (detects CDN from A record IP)

Add to `A_IP_PROVIDERS`:
```js
{ check: (ip) => provider.check_for_<name>_ip(ip), tag: '<name>' },
```

### A-record hostname provider (detects CDN from hostname pattern)

Add to `A_HOSTNAME_PROVIDERS`:
```js
{ check: (h) => provider.check_for_<name>_hostname(h), tag: '<name>' },
```

### Tests

Add tests in `tests/<name>.js` using `assert`. Run with `pnpm test`.

## Config options

| Option | Type | Description |
|--------|------|-------------|
| `dns_resolver` | string | Upstream DNS resolver (IPv6) |
| `self_resolver` | string | Self-listen address |
| `self_port` | string | Listen port |
| `dns64_range` | string | DNS64 synthesis prefix |
| `aggressive_v6` | boolean | Enable aggressive IPv6 (www fallback, extra entries) |
| `v6_only` | boolean | Strip A records from responses |
| `remove_v4_if_v6_exist` | boolean | Suppress A when AAAA exists |
| `dns64` | boolean | Enable DNS64 fallback for domains without AAAA |
| `dns64_only` | boolean | Force all AAAA through DNS64, even native AAAA |
| `no_aaaa` | array | Domains to suppress AAAA for |
| `add_aaaa` | object | Explicit domain→provider/IPv6 overrides |

## Notes on code style

- Keep provider modules small and focused.
- Use `ip-range-check` for IPv4 CIDR matches.
- Return `false` for non-matches.
- Avoid non-ASCII unless the file already uses it.
