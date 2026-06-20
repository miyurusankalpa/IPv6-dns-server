var assert = require('assert');

var cloudflare = require('../providers/cloudflare');
var cloudfront = require('../providers/cloudfront');
var fastly = require('../providers/fastly');
var akamai = require('../providers/akamai');
var bunnycdn = require('../providers/bunnycdn');
var netlify = require('../providers/netlify');
var alicdn = require('../providers/alicdn');
var gcorecdn = require('../providers/gcorecdn');
var blazingcdn = require('../providers/blazingcdn');
var weebly = require('../providers/weebly');
var cdn77 = require('../providers/cdn77');
var awsglb = require('../providers/awsglobalaccelerator');
var edgecast = require('../providers/edgecast_windows');
var limelight = require('../providers/limelight');
var azurewebsites = require('../providers/azurewebsites');
var cachefly = require('../providers/cachefly');

// Top 100 domains by traffic (approximate) and their expected CDN/provider detection
// This test validates that our hostname detection correctly identifies known CDN providers
// for popular domains. It does NOT make network requests.

var topDomains = [
  // Google properties - no CDN match expected
  { domain: "www.google.com", provider: false },
  { domain: "google.com", provider: false },
  { domain: "youtube.com", provider: false },
  { domain: "www.youtube.com", provider: false },
  { domain: "mail.google.com", provider: false },
  { domain: "translate.google.com", provider: false },
  { domain: "maps.google.com", provider: false },
  { domain: "drive.google.com", provider: false },
  { domain: "docs.google.com", provider: false },

  // Facebook - Cloudflare
  { domain: "www.facebook.com", provider: false },
  { domain: "facebook.com", provider: false },
  { domain: "cdninstagram.com", provider: false },

  // Twitter/X - Cloudflare (via add_aaaa)
  { domain: "twitter.com", provider: false },
  { domain: "www.twitter.com", provider: false },
  { domain: "x.com", provider: false },

  // Amazon - various
  { domain: "www.amazon.com", provider: false },
  { domain: "amazon.com", provider: false },
  { domain: "media-amazon.com", provider: false },

  // Wikipedia - no CDN
  { domain: "www.wikipedia.org", provider: false },
  { domain: "wikipedia.org", provider: false },

  // Reddit - Fastly (detected via SOA authority, not hostname)
  { domain: "www.reddit.com", provider: false },
  { domain: "reddit.com", provider: false },
  { domain: "i.redd.it", provider: false },
  { domain: "preview.redd.it", provider: false },

  // Netflix - no CDN match
  { domain: "www.netflix.com", provider: false },

  // Microsoft - MS Edge
  { domain: "www.microsoft.com", provider: false },
  { domain: "bing.com", provider: false },

  // Apple - no CDN match
  { domain: "www.apple.com", provider: false },
  { domain: "icloud.com", provider: false },

  // GitHub - Fastly (GitHub Pages)
  { domain: "github.com", provider: false },
  { domain: "github.io", provider: false },
  { domain: "raw.githubusercontent.com", provider: false },

  // Cloudflare-hosted domains
  { domain: "discord.com", provider: false },
  { domain: "cdn.cloudflare.net", provider: "cloudflare" },
  { domain: "example.cdn.cloudflare.net", provider: "cloudflare" },

  // Shopify stores
  { domain: "mystore.myshopify.com", provider: "shopify" },
  { domain: "cdn.shopify.com", provider: "shopify" },

  // Webflow
  { domain: "assets.webflow.com", provider: "webflow" },

  // Netlify
  { domain: "mysite.netlify.com", provider: "netlify" },
  { domain: "app.netlify.com", provider: "netlify" },

  // BunnyCDN
  { domain: "example.b-cdn.net", provider: "bunnycdn" },

  // CloudFront
  { domain: "d111111abcdef8.cloudfront.net", provider: "cloudfront" },
  { domain: "d2nx6o0k6k6y2o.cloudfront.net", provider: "cloudfront" },

  // Akamai
  { domain: "a1234.akamaiedge.net", provider: "akamai" },
  { domain: "e5.o.lki.", provider: false },

  // Alibaba CDN
  { domain: "g.alicdn.com", provider: "alicdn" },
  { domain: "img.alicdn.com", provider: "alicdn" },

  // Gcore CDN
  { domain: "example.gcdn.co", provider: "gcorecdn" },

  // BlazingCDN
  { domain: "example.blazingcdn.net", provider: "blazingcdn" },

  // CDN77
  { domain: "example.cdn77.org", provider: "cdn77" },

  // Weebly
  { domain: "mysite.weebly.com", provider: "weebly" },

  // AWS Global Accelerator
  { domain: "abc.awsglobalaccelerator.com", provider: "awsglobalaccelerator" },

  // Edgecast/Verizon
  { domain: "example.v0cdn.net", provider: "edgecast_windows" },

  // Limelight
  { domain: "example.llnwi.net", provider: "limelight" },

  // Azure Websites
  { domain: "mysite.azurewebsites.windows.net", provider: "azurewebsites" },

  // CacheFly
  { domain: "rvip1.g.cachefly.net", provider: "cachefly" },

  // Non-CDN domains
  { domain: "example.com", provider: false },
  { domain: "localhost", provider: false },
  { domain: "192.168.1.1", provider: false },
];

function detectProvider(hostname) {
  if (cloudflare.check_for_cloudflare_hostname(hostname)) return "cloudflare";
  if (cloudflare.check_for_shopify_hostname(hostname)) return "shopify";
  if (cloudflare.check_for_webflow_hostname(hostname)) return "webflow";
  if (cloudfront.check_for_cloudfront_hostname(hostname)) return "cloudfront";
  if (fastly.check_for_fastly_hostname(hostname)) return "fastly";
  if (akamai.check_for_akamai_hostname(hostname)) return "akamai";
  if (bunnycdn.check_for_bunnycdn_hostname(hostname)) return "bunnycdn";
  if (netlify.check_for_netlify_hostname(hostname)) return "netlify";
  if (alicdn.check_for_alicdn_hostname(hostname)) return "alicdn";
  if (gcorecdn.check_for_gcorecdn_hostname(hostname)) return "gcorecdn";
  if (blazingcdn.check_for_blazingcdn_hostname(hostname)) return "blazingcdn";
  if (weebly.check_for_weebly_hostname(hostname)) return "weebly";
  if (cdn77.check_for_cdn77_hostname(hostname)) return "cdn77";
  if (awsglb.check_for_awsglb_hostname(hostname)) return "awsglobalaccelerator";
  if (edgecast.check_for_v0cdn_hostname(hostname)) return "edgecast_windows";
  if (limelight.check_for_lln_hostname(hostname)) return "limelight";
  if (azurewebsites.check_for_azureweb_hostname(hostname)) return "azurewebsites";
  if (cachefly.check_for_cachefly_hostname(hostname)) return "cachefly";
  return false;
}

var passed = 0;
var failed = 0;

topDomains.forEach(function (item) {
  var detected = detectProvider(item.domain);
  if (detected === item.provider) {
    passed++;
  } else {
    failed++;
    console.log("FAIL: " + item.domain + " expected=" + item.provider + " got=" + detected);
  }
});

assert.equal(failed, 0, failed + " domain(s) failed provider detection");

console.log("Top 100 Domains Test: " + passed + "/" + topDomains.length + " passed");
console.log("All Tests Passed");
