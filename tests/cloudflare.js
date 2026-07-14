var assert = require('assert');
var cloudflare = require('../providers/cloudflare');

// check_for_cloudflare_hostname — positive cases (*.cdn.cloudflare.net)
assert.equal(cloudflare.check_for_cloudflare_hostname("abc.def.cdn.cloudflare.net"), true);
assert.equal(cloudflare.check_for_cloudflare_hostname("example.cdn.cloudflare.net"), true);
assert.equal(cloudflare.check_for_cloudflare_hostname("discord.com.cdn.cloudflare.net"), true);
assert.equal(cloudflare.check_for_cloudflare_hostname("a.cdn.cloudflare.net"), true);
assert.equal(cloudflare.check_for_cloudflare_hostname("foo.bar.baz.cdn.cloudflare.net"), true);

// check_for_cloudflare_hostname — negative cases
assert.equal(cloudflare.check_for_cloudflare_hostname("foo.bar.cloudflare.net"), false); // missing cdn
assert.equal(cloudflare.check_for_cloudflare_hostname("cdn.cloudflare.com"), false); // .com not .net
assert.equal(cloudflare.check_for_cloudflare_hostname("cdn.cloudflare.net"), true); // base domain itself matches
assert.equal(cloudflare.check_for_cloudflare_hostname("example.com"), false);
assert.equal(cloudflare.check_for_cloudflare_hostname(null), false);
assert.equal(cloudflare.check_for_cloudflare_hostname(undefined), false);

// check_for_cloudflare_a
assert.equal(cloudflare.check_for_cloudflare_a("dns.cloudflare.com"), true);
assert.equal(cloudflare.check_for_cloudflare_a("ns1.example.com"), false);
assert.equal(cloudflare.check_for_cloudflare_a(null), false);

// check_for_cloudflare_ip
assert.equal(cloudflare.check_for_cloudflare_ip("104.16.0.1"), true);
assert.equal(cloudflare.check_for_cloudflare_ip("104.21.0.1"), true);
assert.equal(cloudflare.check_for_cloudflare_ip("162.159.128.1"), true);
assert.equal(cloudflare.check_for_cloudflare_ip("1.2.3.4"), false);
assert.equal(cloudflare.check_for_cloudflare_ip(null), false);

// Zendesk via Cloudflare
assert.equal(cloudflare.check_for_cloudflare_ip("216.198.53.1"), true);
assert.equal(cloudflare.check_for_cloudflare_ip("216.198.54.1"), true);

// WP Engine via Cloudflare
assert.equal(cloudflare.check_for_cloudflare_ip("141.193.213.1"), true);

// getcloudflarev6address
assert.equal(cloudflare.getcloudflarev6address(), "2606:4700::6810:bad");

// check_for_shopify_hostname
assert.equal(cloudflare.check_for_shopify_hostname("mystore.myshopify.com"), "mystore.myshopify.com");
assert.equal(cloudflare.check_for_shopify_hostname("cdn.shopify.com"), "cdn.shopify.com");
assert.equal(cloudflare.check_for_shopify_hostname("example.com"), false);
assert.equal(cloudflare.check_for_shopify_hostname(null), false);

// check_for_shopify_ip
assert.equal(cloudflare.check_for_shopify_ip("23.227.37.1"), true);
assert.equal(cloudflare.check_for_shopify_ip("23.227.38.1"), true);
assert.equal(cloudflare.check_for_shopify_ip("23.227.60.1"), true);
assert.equal(cloudflare.check_for_shopify_ip("1.2.3.4"), false);
assert.equal(cloudflare.check_for_shopify_ip(null), false);

// getshopifyv6address
assert.equal(cloudflare.getshopifyv6address(), "2620:127:f00f::");

// check_for_webflow_hostname
assert.equal(cloudflare.check_for_webflow_hostname("mysite.webflow.com"), "mysite.webflow.com");
assert.equal(cloudflare.check_for_webflow_hostname("example.com"), false);
assert.equal(cloudflare.check_for_webflow_hostname(null), false);

// check_for_webflow_ip
assert.equal(cloudflare.check_for_webflow_ip("198.202.211.1"), true);
assert.equal(cloudflare.check_for_webflow_ip("75.2.70.75"), true);
assert.equal(cloudflare.check_for_webflow_ip("99.83.190.102"), true);
assert.equal(cloudflare.check_for_webflow_ip("1.2.3.4"), false);
assert.equal(cloudflare.check_for_webflow_ip(null), false);

// getwebflowv6address
assert.equal(cloudflare.getwebflowv6address(), "2620:cb:2000::1");

console.log("All Tests Passed");
