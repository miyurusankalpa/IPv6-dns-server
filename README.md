# IPv6 DNS Proxy Server

A DNS proxy that adds IPv6 support to CDNs and services that don't offer it natively. Point your DNS to this server and it will synthesize AAAA records for domains behind known CDNs, so IPv6-only networks can reach them.

Based on [Peteris Nikiforovs' tutorial](https://peteris.rocks/blog/dns-proxy-server-in-node-js-with-ui/).

## Quick Start

```bash
git clone https://gitlab.com/miyurusankalpa/IPv6-dns-server.git
cd IPv6-dns-server
pnpm install
cp config.json.sample config.json
pnpm start
```

Then set your system DNS to `[::1]:533` (or the address/port from your config).

### Docker

```bash
docker pull miyurulk/ipv6-dns-proxy
# or build locally
docker build -t miyurulk/ipv6-dns-proxy .
```

Make sure `self_resolver` is `::` in `config.json`, then:

```bash
docker run --privileged \
  -p 53:53/tcp \
  -p 53:53/udp \
  --name ipv6-dns-proxy \
  -v config.json:/usr/src/app/config.json \
  miyurulk/ipv6-dns-proxy
```

Get the container's IPv6 address:
```bash
docker inspect -f '{{.NetworkSettings.Networks.bridge.GlobalIPv6Address}}' ipv6-dns-proxy
```

### Interactive Demo (Desktop + Browser)

A self-contained demo image that launches a full XFCE desktop with Chromium, the DNS server running, and IPv6 search pre-configured. Great for trying out the proxy visually.

```bash
# Build the demo image
docker build -f demo.Dockerfile -t ipv6-demo .

# Run it
docker run -p 3001:3001 ipv6-demo
```

Then open `http://localhost:3001` in your browser. The Dockerfile clones this repo into the image, installs dependencies, and runs the DNS server as an S6 service. The desktop will load with Chromium already open to [ip6.biz](https://ip6.biz) — a site that shows your IPv6 connectivity status. The DNS proxy runs automatically inside the container, and Chromium has IPv6 Google Search pinned to the toolbar. The [IPvFoo](https://chromewebstore.google.com/detail/ipvfoo/ecanpcehffngcegjmadlcijfolapggal) extension is also pre-installed and pinned, so you can see IPv4 vs IPv6 addresses on every page you visit.

## Configuration

All options go in `config.json`:

| Option | Default | Description |
|--------|---------|-------------|
| `dns_resolver` | `2606:4700:4700::1111` | Upstream DNS resolver (IPv6 address) |
| `self_resolver` | `::1` | Address to listen on (`::` for all interfaces) |
| `self_port` | `53` | Port to listen on |
| `dns64_range` | `64:ff9b::` | DNS64 synthesis prefix |
| `aggressive_v6` | `false` | Enable extra IPv6 synthesis (see below) |
| `v6_only` | `false` | Strip A records from all responses |
| `remove_v4_if_v6_exist` | `false` | Suppress A records when AAAA exists |
| `dns64` | `false` | Enable DNS64 fallback for domains without AAAA |
| `dns64_only` | `false` | Force all AAAA through DNS64, ignoring native AAAA |
| `no_aaaa` | `[]` | Domains to never return AAAA for |
| `add_aaaa` | `{}` | Explicit domain-to-IPv6 overrides |

### Common Configurations

**Basic proxy** (just add IPv6 where possible):
```json
{ "dns_resolver": "2606:4700:4700::1111", "dns64": true }
```

**IPv6-only network** (hide all IPv4):
```json
{ "v6_only": true, "dns64": true, "aggressive_v6": true }
```

**Force DNS64 for everything** (bypass broken native IPv6 paths):
```json
{ "dns64_only": true, "dns64_range": "64:ff9b::" }
```

### Custom IPv6 Overrides

Force a specific domain to return a given IPv6 address:

```json
"add_aaaa": {
  "example.com": "2001:db8::1",
  "api.example.com": "2001:db8::2"
}
```

### Disable IPv6 for a Domain

Add it to `no_aaaa`:
```json
"no_aaaa": ["broken-ipv6.example.com"]
```

Or at runtime, prepend `_noaaaa.` to the domain (e.g., `_noaaaa.example.com`) to disable AAAA for that session.

### Aggressive Mode

When `aggressive_v6` is `true`, the proxy additionally:

- Tries `www.<domain>` AAAA records for apex domains (e.g., `live.com`)
- Uses SOA authority matching for Fastly and Cloudflare
- Adds hardcoded IPv6 for Steam, Twitter/X, and Google Android domains

### DNS64 Modes

- **`dns64: true`** — Synthesizes AAAA records via DNS64 only for domains that have no native AAAA. Uses the prefix in `dns64_range` (default `64:ff9b::`).
- **`dns64_only: true`** — Synthesizes AAAA for ALL domains, even those with native AAAA. Useful when the native IPv6 path is broken or filtered. Explicit `add_aaaa` IPv6 overrides still take precedence.

## How It Works

The proxy intercepts AAAA (IPv6) DNS queries and tries to synthesize responses when the upstream DNS doesn't return any. It detects CDNs using three signals:

1. **Hostname patterns** — e.g., `*.cdn.cloudflare.net` identifies Cloudflare, `*.cloudfront.net` identifies CloudFront
2. **IP ranges** — When resolving A records, the returned IPv4 is checked against known CDN IP ranges
3. **SOA authority** — The DNS authority record (e.g., `dns.cloudflare.com`) identifies the CDN's DNS

Once a CDN is detected, the proxy generates an IPv6 address using one of:

| Method | Used by | How |
|--------|---------|-----|
| **Hostname rewrite** | Akamai, CloudFront, BunnyCDN, etc. | Rewrites the hostname to an IPv6-enabled equivalent (e.g., `dualstack.` prefix) |
| **v4-to-v6 mapping** | Fastly, MS Edge, WordPress VIP | Deterministically maps the IPv4 address to an IPv6 address |
| **Static anycast** | Cloudflare, Weebly, Shopify | Returns a known anycast IPv6 address |
| **DNS resolution** | CloudFront, CDN77, Netlify, etc. | Resolves AAAA for a known IPv6-enabled reference domain |

### Request Flow

```
Client → AAAA query for example.com
  → Check add_aaaa overrides (explicit IPv6 or provider tag)
  → If native AAAA exists from upstream → pass through
  → If domain is in no_aaaa → suppress or DNS64-map
  → Run provider detection chain (28 providers, first match wins)
  → Fallback: try www. prefix (aggressive mode), DNS64 synthesis, or return empty
```

## Supported CDNs

| Provider | Detection | IPv6 Method | Test Domains |
|----------|-----------|-------------|--------------|
| **Cloudflare** | Hostname (`*.cdn.cloudflare.net`), SOA, IP ranges | Static anycast | discord.com, db-ip.com |
| **Akamai** | Hostname (`*.akamaiedge.net`, `*.akamai.net`) | Hostname rewrite | www.nvidia.com, www.amd.com |
| **Fastly** | SOA (`hostmaster.fastly.com`), hostname, IP ranges | v4→v6 mapping | imgur.com, www.twitch.tv |
| **CloudFront** | Hostname (`*.cloudfront.net`), IP ranges | DNS resolution | www.figma.com, vod-secure.twitch.tv |
| **Amazon S3** | Hostname (`*.s3.amazonaws.com`, etc.) | Hostname rewrite | s3.amazonaws.com |
| **Azure Websites** | Hostname (`*.azurewebsites.windows.net`) | Hostname rewrite | ibwc.azurewebsites.net |
| **MS Edge** | SOA (`*msedge.net*`) | v4→v6 mapping | onedrive.live.com |
| **Edgecast/Verizon** | Hostname (`*.v0cdn.net`) | Hostname rewrite | software-download.microsoft.com |
| **BunnyCDN** | Hostname (`*.b-cdn.net`) | DNS resolution | cdn-b-east.streamable.com |
| **BlazingCDN** | Hostname (`*.blazingcdn.net`) | DNS resolution | player.h-cdn.com |
| **Gcore CDN** | Hostname (`*.gcdn.co`) | DNS resolution | v58.tiktokcdn.com |
| **CDN77** | SOA (`admin.cdn77.com`), hostname (`*.cdn77.org`) | DNS resolution | streaming-s1free.sport1.de |
| **CacheFly** | Hostname (`rvip/vip.*.cachefly.net`), IP range | v4→v6 mapping | cdn.arstechnica.net |
| **Sucuri** | IP range (`192.124.249.0/24`) | DNS resolution | www.exploit-db.com |
| **Weebly** | Hostname (`*.weebly.com`), IP range | Static | www.weebly.com |
| **Netlify** | Hostname (`*.netlify.com`), IP range | DNS resolution | 10minutetimers.com |
| **AliCDN** | Hostname (`*.alicdn.com`) | DNS resolution | gd1.alicdn.com |
| **Alibaba OSS** | Hostname (`*.aliyuncs.com`, `*.aliyun-inc.com`) | Hostname rewrite | oss.aliyuncs.com |
| **Oracle Object Storage** | Hostname (`*.oraclecloud.com`, `*.oci.customer-oci.com`) | Hostname rewrite | objectstorage.us-ashburn-1.oci.customer-oci.com |
| **AWS Global Accelerator** | Hostname (`*.awsglobalaccelerator.com`) | Hostname rewrite | public.ecr.aws |
| **AWS IPv6** | Hostname (`*.<region>.amazonaws.com`) | Hostname rewrite (`→ *.api.aws`) | ec2.ap-southeast-1.amazonaws.com, lambda.us-east-1.amazonaws.com |
| **Limelight** | Hostname (`*.llnwi.net`) | Hostname rewrite | fota-ll-dn.ospserver.net |
| **Bearblog** | IP range (`159.223.204.176/32`) | DNS resolution | hypr.moe |
| **WordPress VIP** | IP range (`192.0.66.0/24`) | v4→v6 mapping | wpvip.com, nielsen.com |
| **GitHub Pages** | IP range (`185.199.108.0/22`) | v4→v6 mapping (via Fastly) | willettjf.com |
| **Shopify** | Hostname (`*.myshopify.com`, `*.shopify.com`), IP range | Static | shopify.com |
| **Webflow** | Hostname (`*.webflow.com`), IP range | Static | www.visma.com |
| **PTR-based** | IP range (INWX, Brightbox) | PTR lookup | www.domainprivacyprotect.info |

### Cloudflare Sub-services

Cloudflare IP ranges also cover: Zendesk, WP Engine, ServDC, and Laravel Cloud.

## Running Tests

```bash
pnpm test
```

This runs all provider unit tests and a top-100-domains integration test.

## Architecture

```
app.js                    Main server (771 lines)
├── providers/            CDN detection and IPv6 generation (27 modules)
├── tests/                Unit + integration tests (24 files)
├── ptrcheck.js           PTR-based IPv6 detection
└── config.json           Runtime configuration
```

Provider detection uses data-driven registries (`AAAA_PROVIDERS`, `A_IP_PROVIDERS`, `A_HOSTNAME_PROVIDERS`) with a loop-and-break pattern that eliminates missing-return bugs by design. Adding a new provider requires adding one entry to the appropriate array.

See [AGENTS.md](AGENTS.md) for detailed architecture documentation.

## Credits

- [Peteris Nikiforovs](https://peteris.rocks/) — Original tutorial

## Similar Projects

- [DeLegacy IPv6 RPZ Project](https://codeberg.org/IPv6-Monostack/delegacy-rpz/)

## Author

- [v6check](https://v6check.miyuru.lk/)
- [v6monitor](https://v6monitor.com/)
- [More projects](https://www.miyuru.lk/tools)
