var ipRangeCheck = require("ip-range-check");

// Vercel's anycast IPv6 edge (ARIN VERCEL-13, announced via AS16509).
// Served by cdn1.vercel-dns.com. Note: this prefix only terminates TLS for
// Vercel-owned hostnames (*.vercel.com, *.nextjs.org) — other Vercel sites
// return a CloudFront 403 over it, so only use it for those.
var vercel_fixed_v6 = "2607:db00::100:137:4:9d02";

// Hostnames the cdn1 IPv6 prefix is known to serve, measured 2026-10-06:
//   vercel.com, www.vercel.com, cdn1.vercel.com       https 200/308/404
//   nextjs.org, www.nextjs.org                        https 200/307
// Everything else falls through to DNS64.
//
// Deliberately excluded even though Vercel owns them (NS ns1/ns2.vercel-dns.com
// and A records inside vercel_ip_ranges below):
//   *.vercel.app, vercel.sh, vercel.dev, zeit.co, now.sh
// All of those answer 403 CloudFront or fail the TLS handshake over
// 2607:db00::/32, so emitting this address for them would break the site.
// tests/vercel.js holds the full documented corpus and fails if any verdict
// here changes.
var vercel_owned_domains = ["vercel.com", "nextjs.org"];

// Registrable domains used by Vercel for CNAME/A records.
// Covers vercel-dns.com, vercel-dns-0.com and vercel-dns-017.com etc.
var vercel_dns_re = /^vercel-dns(-\d+)?$/;

// Vercel anycast ranges. cdnN.vercel.com (N = number) resolves into these,
// as do the A record targets Vercel hands out for custom domains.
var vercel_ip_ranges = [
  "64.239.109.0/24", // cdn0-cdn60 pool (VERCEL-11)
  "64.239.123.0/24", // cdn0-cdn60 pool (VERCEL-10)
  "216.230.84.0/24", // cdn2 (VERCEL-06)
  "155.121.0.0/16", // cdn1 (VERCEL-14)
  "76.76.21.0/24", // documented apex A 76.76.21.21 (VERCEL-01)
  "66.33.60.0/24", // cname.vercel-dns.com (VERCEL-02)
  "216.198.79.0/24", // apex anycast pool (VERCEL-05)
  "216.150.1.0/24", // VERCEL-09
  "216.150.16.0/24", // VERCEL-08
  "64.29.17.0/24", // vercel.app wildcard (VERCEL-12)
];

function normalizeHostname(hostname) {
  if (!hostname || typeof hostname !== "string") return null;
  var h = hostname.toLowerCase().replace(/\.$/, "");
  return h || null;
}

function matchesDomain(hostname, domain) {
  return hostname === domain || hostname.endsWith("." + domain);
}

module.exports = {
  getvercelv6address: function (resolver, localStorageMemory, callback) {
    var aaaa_vercel_domain = "cdn1.vercel-dns.com";
    const CACHE_KEY = "vercelv6addy";

    // Check cache first
    const cachedV6List = localStorageMemory.getItem(CACHE_KEY);
    if (cachedV6List) {
      const addresses = Array.isArray(cachedV6List) ? cachedV6List : JSON.parse(cachedV6List);
      // Call callback asynchronously to maintain consistent behavior
      setImmediate(() => callback(null, addresses));
      return;
    }

    // Resolve IPv6 addresses
    resolver.resolve6(aaaa_vercel_domain, (err, addresses) => {
      if (err || !addresses || !addresses[0]) {
        localStorageMemory.setItem(CACHE_KEY, JSON.stringify([vercel_fixed_v6]));
        callback(null, [vercel_fixed_v6]);
        return;
      }

      // Cache the result
      localStorageMemory.setItem(CACHE_KEY, JSON.stringify(addresses));
      callback(null, addresses);
    });
  },
  // Broad detection, used to tag A record responses.
  // Matches Vercel-owned domains and every vercel-dns* CNAME target
  // Vercel documents (cname.vercel-dns.com, cname.vercel-dns-0.com,
  // <hash>.vercel-dns-017.com) plus vercel.app deployments.
  check_for_vercel_hostname: function (hostname) {
    var h = normalizeHostname(hostname);
    if (!h) return false;

    for (var i = 0; i < vercel_owned_domains.length; i++) {
      if (matchesDomain(h, vercel_owned_domains[i])) return true;
    }

    if (matchesDomain(h, "vercel.app")) return true;

    var labels = h.split(".");
    if (labels.length >= 2 && labels[labels.length - 1] === "com" && vercel_dns_re.test(labels[labels.length - 2])) return true;

    return false;
  },
  // Narrow detection: only hostnames verified to serve TLS on 2607:db00::/32.
  // Everything else must keep falling through to DNS64.
  check_for_vercel_owned_hostname: function (hostname) {
    var h = normalizeHostname(hostname);
    if (!h) return false;

    for (var i = 0; i < vercel_owned_domains.length; i++) {
      if (matchesDomain(h, vercel_owned_domains[i])) return true;
    }

    return false;
  },
  // Rewrite <label>.vercel-dns[-N].com → <label>.dualstack.vercel-dns[-N].com
  // so that Vercel's dualstack endpoints are used once they publish AAAA.
  // Same intent as check_for_awsglb_hostname, but the vercel-dns* label is the
  // second-to-last one rather than at a fixed depth. Idempotent.
  check_for_vercel_dualstack_hostname: function (hostname) {
    var h = normalizeHostname(hostname);
    if (!h) return false;

    var labels = h.split(".");
    // require at least one label in front of vercel-dns* so the bare
    // vercel-dns.com apex is never hijacked
    if (labels.length < 3 || labels[labels.length - 1] !== "com") return false;

    var pos = labels.length - 2;
    if (!vercel_dns_re.test(labels[pos])) return false;

    if (labels[pos - 1] !== "dualstack") labels.splice(pos, 0, "dualstack");

    return labels.join(".");
  },
  check_for_vercel_ip: function (ipv4) {
    if (!ipv4) return false;

    return ipRangeCheck(ipv4, vercel_ip_ranges);
  },
};
