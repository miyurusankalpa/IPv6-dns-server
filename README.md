# Introduction

A simple Node DNS proxy Server based on [Peteris Rocks tutorial](https://peteris.rocks/blog/dns-proxy-server-in-node-js-with-ui/), which serves IPv6 records if a CDN is matched.

## Running locally

Clone the repo

	git clone https://gitlab.com/miyurusankalpa/IPv6-dns-server.git

Build the project

	npm install

Copy the sample config

	cp config.json.sample config.json
	
Starting the server

	npm start

or with pm2:

	pm2 start app.js

## Use Docker Image [Testing]

Build: `docker build -t miyurulk/ipv6-dns-proxy .`

Pull: `docker pull miyurulk/ipv6-dns-proxy`

Change the `self_resolver` to `::` in `config.js`

Run:
```
docker run --privileged \
  -p 53:53/tcp \
  -p 53:53/udp \
  --name ipv6-dns-proxy \
  -v config.js:/usr/src/app/config.js \
   miyurulk/ipv6-dns-proxy
```

Get the container IP: `docker inspect -f '{{.NetworkSettings.Networks.bridge.GlobalIPv6Address}}' ipv6-dns-proxy`

## Config Options

### Changing DNS Proxy IP and Port

Change the `self_resolver` and `self_port` variables in the `config.json` file. By default it listens to [::1]:53

### Changing Upstream DNS Resolvers

Change the `dns_resolver` variable in the `config.json` file.

### Temporarily disable AAAA records for a domain

If the domain gives a system error, append `_noaaaa` to the domain and the domain with be IPv4 only for the rest of the session.

### Disable IPv6 for a domain permanently

Add the domain to `no_aaaa` array in the `config.json` file.

### Add a custom IPv6 for a domain

Add the domain to `add_aaaa` object with IPv6 address in the `config.json` file.

### Turn on **Aggressive Mode**

Change the `aggressive_v6` variable to true in the `config.json` file. See individual services below to see what aggressive mode does.

### Enable DNS64 support

Change the `dns64` variable to true in the `config.json` file. If the prefix is diffrent from the default, change the `dns64_range` as well.

### Turn on IPv6 only mode

Change the `v6_only` variable to true in the `config.json` file.

### Disable Happy Eyeballs

Change the `remove_v4_if_v6_exist` variable to true in the `config.json` file. This will remove the A record only if a AAAA record exists.

# Testing if DNS proxy is working

## Cloudflare

* Test domains: db-ip.com
* IPv6 Type: Anycast
* Usability: Stable
* Coverage: All
* Aggressive mode: All cloudflare services which uses their **DNS service**, regardless of cloudflare proxy has been disabled(grey cloud) will get a Cloudflare IPv6 address.

## Akamai

* Test domains: www.nvidia.com, www.amd.com
* IPv6 Type: Unicast
* Coverage: All
* Usability: Stable

## Fastly

* Test domains: imgur.com, www.twitch.tv
* IPv6 Type: Anycast, Unicast
* Coverage: All
* Usability: Stable

## Amazon S3

* Test domains: s3.amazonaws.com, github-production-release-asset-2e65be.s3.amazonaws.com
* IPv6 Type: Unicast
* Coverage: *.s3.amazonaws.com and s3 websites hostnames/cnames only.
* Usability: Stable

## Amazon Cloudfront

* Test domains: www.figma.com, vod-secure.twitch.tv
* IPv6 Type: Unicast
* Coverage: All
* Usability: Stable

## Alibaba OSS

* Test domains: oss.aliyuncs.com, alicloud-common.oss-ap-southeast-1.aliyuncs.com, docs-aliyun.cn-hangzhou.oss.aliyun-inc.com
* IPv6 Type: Unicast
* Coverage: All from aliyuncs.com and aliyun-inc.com
* Usability: Stable

## AliCDN

* Test domains: gd1.alicdn.com
* IPv6 Type: Unicast
* Coverage: All from alicdn.com
* Usability: Unknown

## Bunny CDN

* Test domains: cdn-b-east.streamable.com
* IPv6 Type: Unicast
* Coverage: All
* Usability: Stable

## BlazingCDN

* Test domains: player.h-cdn.com
* IPv6 Type: Anycast
* Coverage: All
* Usability: Stable

## Gcore CDN

* Test domains: v58.tiktokcdn.com
* IPv6 Type: Unicast
* Coverage: All
* Usability: Stable

## Microsoft Edge

* Test domains: onedrive.live.com
* IPv6 Type: Anycast
* Coverage: Only on some services
* Usability: Stable

## Microsoft Windows (Edgecast)

* Test domains: software-download.microsoft.com
* IPv6 Type: Unicast
* Coverage: Only on some services
* Usability: Unknown

## Limelight Networks

* Test domains: fota-ll-dn.ospserver.net, dmotion.s.llnwi.net
* IPv6 Type: Unicast
* Coverage: Only on some services
* Usability: Unknown

## Sucuri

* Test domains: www.exploit-db.com
* IPv6 Type: Anycast
* Coverage: Only on some services
* Usability: Unknown

## Weebly

* Test domains: www.weebly.com
* IPv6 Type: Unicast
* Coverage: Unknown
* Usability: Unknown

## CDN77

* Test domains: img-b.udemycdn.com
* IPv6 Type: Unicast
* Coverage: All+Only on Aggressive mode.
* Usability: Some protected content may not work.

## Netlify

* Test domains: apex-loadbalancer.netlify.com, 10minutetimers.com
* IPv6 Type: Unicast
* Coverage: Unknown
* Usability: Unknown

## Bearblog

* Test domains: hypr.moe
* IPv6 Type: Unicast
* Coverage: All
* Usability: Stable

## WordPress VIP

* Test domains: wpvip.com, nielsen.com
* IPv6 Type: Anycast
* Coverage: Unknown
* Usability: Unknown

# INWX

* Test domains: inwx.com
* IPv6 Type: Unicast
* Coverage: Some Domains+Only on Aggressive mode.
* Usability: Unknown

# Azure websites

* Test domains: ibwc.azurewebsites.net
* IPv6 Type: Unicast
* Coverage: Partial. (www.ibwc.gov is not matched)
* Usability: Unknown

# AWS Blobal Accelerator

* Test domains: eu-central-1.console.aws.amazon.com
* IPv6 Type: Anycast
* Coverage: Partial. (no root/ip match)
* Usability: Unknown

## Github.io (Fastly)

* Test domains: willettjf.com
* IPv6 Type: Anycast
* Coverage: Only IPv4 match
* Usability: Stable

## Shopify (Cloudflare)

* Test domains: shopify.com, shopify-debug.com
* IPv6 Type: Anycast
* Coverage: All
* Usability: Unknown

## Webflow (Cloudflare)

* Test domains: www.visma.com, theaterfreunde-wiesbaden.de
* IPv6 Type: Anycast
* Coverage: All
* Usability: Unknown

## msidentity (Microsoft) [DISABLED]

* Test domains: login.live.com (#10)
* IPv6 Type: Unicast
* Coverage: Some Domains+Only on Aggressive mode.
* Usability: Unusable, HTTP 400

## AAAA WWW Check (Experimental)

* Test domains: live.com (#24)
* IPv6 Type: N/A
* Coverage: Only on Aggressive mode.
* Usability: Unknown

# How does this work

One thing this app does is use only the DNS data returned by the DNS provider to synthesize the requests.

For that we use the following information

- A - IPv4 records, match known provider IP
- Hostname - CDN usually have a domain they provide the users which we can use to detect the provider
- DNS Authority - Some CDN providers provide their own DNS, which we can use to detect the provider.


The next part is getting IPv6 address, for this below methods are used

- Synthesize the IPv6 from IPv4 adddress (Fastly)
- Use known IPv6 addresss - (MSEDGE)
- Use any IPv6 address -  (Cloudfront)
- Generate IPv6 enabled hostname (Akamai)

# Credits
* [Pēteris Ņikiforovs](https://peteris.rocks/)
