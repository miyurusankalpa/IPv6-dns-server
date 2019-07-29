# Introduction

A simple Node DNS Server proxy based on [Peteris Rocks tutorial](https://peteris.rocks/blog/dns-proxy-server-in-node-js-with-ui/), which serves IPv6 records if a CDN is matched.

## Running locally

Clone the repo

	git clone https://gh6.mortzu.de/miyurusankalpa/IPv6-dns-server.git

Build the project 

	npm install

Starting the server 

	npm start

## Changing DNS Resolvers

Change the `dns_resolver` variable in the app.js file.

## Disable IPv6 for a domain

Add the domain to `noaaaa` array in the app.js file.

## Add a custom IPv6 for a domain

Add the domain to `addaaaa` object with IPv6 address in the app.js file.

# Testing if DNS proxy is working

## Cloudflare

* Test domains: troyhunt.com, news.ycombinator.com
* IPv6 Type: Anycast
* Usability: TLS connectivity issues on some sites that does not have cloudflare ssl cert 
* Coverage: All+See note
* Note: All cloudflare services which uses their **DNS service**, regardless of cloudflare proxy has been disabled(grey cloud) will get a proxied.

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

* Test domains: github-production-release-asset-2e65be.s3.amazonaws.com
* IPv6 Type: Unicast
* Coverage: *.s3.amazonaws.com hostnames/cnames only.
* Usability: Stable

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

* Test domains: software-download.microsoft.com
* IPv6 Type: Unicast
* Coverage: Only on some services
* Usability: Unknown

## Github.io (Fastly)

* Test domains: twitter.github.io
* IPv6 Type: Anycast
* Coverage: Only *.github.io domains
* Usability: unstable (some custom domains still get proxied)
* Note: HTTPS breaks on custom domains, hence no IPv6 address added 

## Stack Exchange sites (Fastly)

* Test domains: stackoverflow.com
* IPv6 Type: Anycast
* Coverage: All
* Usability: Logout or delete cookies

# Credits
* [Pēteris Ņikiforovs](https://peteris.rocks/)