# Introduction

A simple Node DNS Server proxy based on [Peteris Rocks tutorial](https://peteris.rocks/blog/dns-proxy-server-in-node-js-with-ui/), which serves IPv6 records if a CDN is matched.

## Running localy

Clone the repo and branch

	git clone https://gh6.mortzu.de/miyurusankalpa/IPv6-dns-server.git -b ipv6-cdns

Build the project 

	npm install

Starting the server 

	npm start

# Changing DNS Resolvers

Change the `dns_resolver` variable in the app.js file.

# Testing if DNS proxy is working

## Cloudflare

* Test domains: troyhunt.com, news.ycombinator.com
* IPv6 Type: Anycast
* Usability: TLS connectivity issues on some sites
* Coverage: All+See note
* Note: All cloudflare services which uses their **DNS service**, regardless of cloudflare proxy has been disabled(grey cloud) will get a proxied.

## Akamai

* Test domains: www.last.fm, www.amd.com
* IPv6 Type: Unicast
* Coverage: All
* Usability: Stable

## Faslty 

* Test domains: imgur.com, www.twitch.tv
* IPv6 Type: Anycast, Unicast
* Coverage: All
* Usability: Stable

## Amazon S3 

* Test domains: github-production-release-asset-2e65be.s3.amazonaws.com
* IPv6 Type: Unicast
* Coverage: *.s3.amazonaws.com hostnames/cnames only. See Note.
* Usability: Stable
* Note: Some domains are still not matched. Looking into it.

## Amazon Cloudfront 

* Test domains: www.amazon.com, vod-secure.twitch.tv
* IPv6 Type: Unicast
* Coverage: All
* Usability: Stable

## Bunnycdn

* Test domains: cdn-b-east.streamable.com
* IPv6 Type: Unicast
* Coverage: IPv6 is not available in some locations.
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

* Test domains: 
* IPv6 Type: Unicast
* Coverage: Only on some services
* Usability: Unknown

## Github.io (Faslty)

* Test domains: twitter.github.io
* IPv6 Type: Anycast
* Coverage: Only *.github.io domains
* Usability: Stable
* Note: HTTPS breaks on custom domains, hence no IPv6 address added 

## Stackwxcahnge sites (Faslty)

* Test domains: stackoverflow.com
* IPv6 Type: Anycast
* Coverage: All
* Usability: Logout or delete cookies

# Credits
* [Pēteris Ņikiforovs](https://peteris.rocks/)