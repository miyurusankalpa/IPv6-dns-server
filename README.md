| :exclamation:  Project moved to GitLab, due to GitHub's lack of IPv6 support. https://gitlab.com/miyurusankalpa/IPv6-dns-server |
|-----------------------------------------|

# Introduction

A simple Node DNS Server proxy based on [Peteris Rocks tutorial](https://peteris.rocks/blog/dns-proxy-server-in-node-js-with-ui/), which serves IPv6 records if a CDN is matched.

## Running locally

Clone the repo

	git clone https://gitlab.com/miyurusankalpa/IPv6-dns-server.git

Build the project 

	npm install

Starting the server 

	npm start

### Changing DNS Resolvers

Change the `dns_resolver` variable in the app.js file.

### Disable IPv6 for a domain

Add the domain to `no_aaaa` array in the app.js file.

### Add a custom IPv6 for a domain

Add the domain to `add_aaaa` object with IPv6 address in the app.js file.

### Turn off aggressive mode

Change the `aggressive_v6` variable to false in the app.js file. See individual services below to see what aggressive mode does.

### Turn on IPv6 only mode

Change the `v6_only` variable to true in the app.js file.

# Testing if DNS proxy is working

## Cloudflare

* Test domains: db-ip.com
* IPv6 Type: Anycast
* Usability: Stable
* Coverage: All
* Aggressive mode: All cloudflare services which uses their **DNS service**, regardless of cloudflare proxy has been disabled(grey cloud) will get a Cloudflare IPv6 address.

## Akamai

* Test domains: www.last.fm, www.amd.com
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

* Test domains: www.amazon.com, vod-secure.twitch.tv
* IPv6 Type: Unicast
* Coverage: All
* Usability: Stable

## Bunnycdn

* Test domains: cdn-b-east.streamable.com
* IPv6 Type: Unicast
* Coverage: All
* Usability: Stable

## Highwinds

* Test domains: code.jquery.com
* IPv6 Type: Anycast
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

## Wordpress VIP

* Test domains: wpvip.com, nielsen.com
* IPv6 Type: Anycast
* Coverage: Unknown
* Usability: Unknown

## Github.io (Fastly)

* Test domains: sadh.life
* IPv6 Type: Anycast
* Coverage: Only IPv4 match
* Usability: Stable

## Stack Exchange sites (Fastly)

* Test domains: stackoverflow.com
* IPv6 Type: Anycast
* Coverage: All+Only on Aggressive mode.
* Usability: Logout or delete cookies
* Aggressive mode: Errors on some pages

## Twitter (Cloudfront)

* Test domains: twitter.com
* IPv6 Type: Unicast
* Coverage: Some Domains+Only on Aggressive mode.
* Usability: Logout or delete cookies
* Aggressive mode: Errors on some pages

# Credits
* [Pēteris Ņikiforovs](https://peteris.rocks/)
