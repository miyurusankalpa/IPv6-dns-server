var assert = require('assert');
var dns = require('dns');
var tls = require('tls');
var vercel = require('../providers/vercel');

// ---------------------------------------------------------------------------
// Documented Vercel domain corpus
//
// Every hostname below was verified on 2026-10-06 against Cloudflare's
// resolver (2606:4700:4700::1001) and probed directly over the
// 2607:db00::/32 edge. Columns: [hostname, owned, broad, dualstack]
//
//   owned      check_for_vercel_owned_hostname       -> emit cdn1 IPv6?
//   broad      check_for_vercel_hostname             -> tag the A record?
//   dualstack  check_for_vercel_dualstack_hostname   -> rewrite target or false
//
// The HTTPS code in the comment is what the cdn1 IPv6 edge returned for that
// host. 2xx/3xx/404 means TLS completed and the prefix actually serves it.
// 403/000 means CloudFront or a TLS alert rejected it: those hosts must never
// be added to the owned set and keep falling through to DNS64.
//
// This table is the "future check" net: any change to providers/vercel.js that
// flips a documented verdict fails here instead of silently breaking users.
// ---------------------------------------------------------------------------
var CORPUS = [
  // --- A. Vercel-owned, genuinely served by 2607:db00::/32 -----------------
  ["vercel.com", true, true, false],                 // https 200  Server: Vercel
  ["www.vercel.com", true, true, false],             // https 308
  ["cdn1.vercel.com", true, true, false],            // https 404 (TLS ok)
  ["nextjs.org", true, true, false],                 // https 200
  ["www.nextjs.org", true, true, false],             // https 307

  // --- B. *.vercel.app deployments (DNS64 only) ---------------------------
  ["vercel.app", false, true, false],                // https 000 / http 403
  ["service-markup.vercel.app", false, true, false], // https 000

  // --- C. Customer sites on custom domains (DNS64 only) -------------------
  ["rauno.me", false, false, false],                 // https 000
  ["turbo.build", false, false, false],              // https 000
  ["hashnode.com", false, false, false],             // https 000
  ["leerob.io", false, false, false],                // https 000
  ["fumadocs.dev", false, false, false],             // https 000
  ["shadcn.com", false, false, false],               // https 000
  ["clerk.com", false, false, false],                // https 000
  ["mintlify.com", false, false, false],             // https 000
  ["sdk.vercel.ai", false, false, false],            // https 000
  ["www.shadcn.com", false, false, false],           // CNAME cname.vercel-dns.com
  ["www.clerk.com", false, false, false],            // CNAME cname.vercel-dns.com
  ["www.hashnode.com", false, false, false],         // CNAME <hash>.vercel-dns-016.com

  // --- D. Vercel-owned TLDs that are NOT on the cdn1 whitelist -------------
  // NS is ns1/ns2.vercel-dns.com and every A record sits inside our ranges,
  // yet the v6 edge answers 403 CloudFront. Adding any of these to the owned
  // set would hand out an address that cannot complete TLS.
  ["vercel.sh", false, false, false],                // https 000 / http 403
  ["www.vercel.sh", false, false, false],            // https 000 / http 403
  ["vercel-docs.vercel.sh", false, false, false],    // https 000 / http 403
  ["vercel.dev", false, false, false],               // https 000 / http 403
  ["zeit.co", false, false, false],                  // https 000 / http 403
  ["now.sh", false, false, false],                   // https 000 / http 403

  // --- E. vercel-dns* CNAME targets: dualstack rewrite exists ---------------
  // All nine rewritten names resolve today (A records), none are NXDOMAIN.
  ["cname.vercel-dns.com", false, true, "cname.dualstack.vercel-dns.com"],
  ["cname.vercel-dns-0.com", false, true, "cname.dualstack.vercel-dns-0.com"],
  ["cdn1.vercel-dns.com", false, true, "cdn1.dualstack.vercel-dns.com"],
  ["ns1.vercel-dns.com", false, true, "ns1.dualstack.vercel-dns.com"],
  ["7db0c515ced5a8a7.vercel-dns.com", false, true, "7db0c515ced5a8a7.dualstack.vercel-dns.com"],
  ["d1d4fc829fe7bc7c.vercel-dns-017.com", false, true, "d1d4fc829fe7bc7c.dualstack.vercel-dns-017.com"],
  ["89cac538c2d10d22.vercel-dns-016.com", false, true, "89cac538c2d10d22.dualstack.vercel-dns-016.com"],
  ["24591962d549b32b.vercel-dns-013.com", false, true, "24591962d549b32b.dualstack.vercel-dns-013.com"],
  ["bab5f6ed13b0a47e.vercel-dns-012.com", false, true, "bab5f6ed13b0a47e.dualstack.vercel-dns-012.com"],

  // --- F. Blob storage: EC2 behind no-sni.vercel-infra.com, no v6, no alias --
  ["aypchzzf9pftwuto.public.blob.vercel-storage.com", false, false, false],
  ["7nyt0uhk7sse4zvn.public.blob.vercel-storage.com", false, false, false],
  ["public.blob.vercel-storage.com", false, false, false],
  ["blob.vercel-storage.com", false, false, false],

  // --- G. Negative controls ------------------------------------------------
  ["example.com", false, false, false],
  ["wikipedia.org", false, false, false],
  ["notvercel.com", false, false, false],
  ["vercel.com.evil.com", false, false, false],
  ["netlify.com", false, false, false],
  ["amazonaws.com", false, false, false],
  ["myvercel-dns.com", false, false, false],
  ["vercel-dns.net", false, false, false],

  // --- H. Bare vercel-dns* apexes: tagged, but never rewritten -------------
  // broad=true because they are Vercel's own zones; dualstack=false because the
  // length guard keeps the apex out (there is no <label> dualstack form).
  ["vercel-dns.com", false, true, false],
  ["vercel-dns-017.com", false, true, false]
];

CORPUS.forEach(function (row) {
  var host = row[0], owned = row[1], broad = row[2], dualstack = row[3];

  assert.strictEqual(vercel.check_for_vercel_owned_hostname(host), owned,
    "check_for_vercel_owned_hostname(" + host + ")");
  assert.strictEqual(vercel.check_for_vercel_hostname(host), broad,
    "check_for_vercel_hostname(" + host + ")");
  assert.strictEqual(vercel.check_for_vercel_dualstack_hostname(host), dualstack,
    "check_for_vercel_dualstack_hostname(" + host + ")");
});

// The owned set must stay exactly these five. category D is Vercel-owned too,
// but the prefix does not serve it, so it must never leak into this list.
assert.deepStrictEqual(
  CORPUS.filter(function (row) { return row[1]; }).map(function (row) { return row[0]; }).sort(),
  ["cdn1.vercel.com", "nextjs.org", "vercel.com", "www.nextjs.org", "www.vercel.com"]
);

// Every corpus host must survive normalisation the same way it arrives from DNS.
CORPUS.forEach(function (row) {
  var host = row[0];
  assert.strictEqual(vercel.check_for_vercel_owned_hostname(host + "."), row[1], "trailing dot owned: " + host);
  assert.strictEqual(vercel.check_for_vercel_owned_hostname(host.toUpperCase()), row[1], "uppercase owned: " + host);
});

// check_for_vercel_owned_hostname — non-string inputs
assert.equal(vercel.check_for_vercel_owned_hostname(null), false);
assert.equal(vercel.check_for_vercel_owned_hostname(undefined), false);
assert.equal(vercel.check_for_vercel_owned_hostname(""), false);
assert.equal(vercel.check_for_vercel_hostname(null), false);
assert.equal(vercel.check_for_vercel_hostname(undefined), false);
assert.equal(vercel.check_for_vercel_dualstack_hostname(null), false);
assert.equal(vercel.check_for_vercel_dualstack_hostname(undefined), false);

// check_for_vercel_dualstack_hostname — normalisation and idempotency
assert.equal(vercel.check_for_vercel_dualstack_hostname("7db0c515ced5a8a7.vercel-dns.com."), "7db0c515ced5a8a7.dualstack.vercel-dns.com");
assert.equal(vercel.check_for_vercel_dualstack_hostname("89CAC538C2D10D22.vercel-dns-016.com"), "89cac538c2d10d22.dualstack.vercel-dns-016.com");
assert.equal(vercel.check_for_vercel_dualstack_hostname("7db0c515ced5a8a7.dualstack.vercel-dns.com"), "7db0c515ced5a8a7.dualstack.vercel-dns.com");
assert.equal(vercel.check_for_vercel_dualstack_hostname("cname.dualstack.vercel-dns-0.com"), "cname.dualstack.vercel-dns-0.com");
// deep subdomains: the dualstack label goes immediately before vercel-dns*
assert.equal(vercel.check_for_vercel_dualstack_hostname("a.b.c.vercel-dns-017.com"), "a.b.c.dualstack.vercel-dns-017.com");
assert.equal(vercel.check_for_vercel_dualstack_hostname("dms-fsly.example.net"), false);

// check_for_vercel_ip — cdnN.vercel.com ranges plus observed Vercel anycast blocks
assert.equal(vercel.check_for_vercel_ip("64.239.109.193"), true);
assert.equal(vercel.check_for_vercel_ip("64.239.123.1"), true);
assert.equal(vercel.check_for_vercel_ip("216.230.84.1"), true);
assert.equal(vercel.check_for_vercel_ip("155.121.0.3"), true);
assert.equal(vercel.check_for_vercel_ip("155.121.255.254"), true);
assert.equal(vercel.check_for_vercel_ip("76.76.21.21"), true);
assert.equal(vercel.check_for_vercel_ip("66.33.60.194"), true);
assert.equal(vercel.check_for_vercel_ip("216.198.79.1"), true);
assert.equal(vercel.check_for_vercel_ip("216.150.1.1"), true);
assert.equal(vercel.check_for_vercel_ip("216.150.16.65"), true);
assert.equal(vercel.check_for_vercel_ip("64.29.17.67"), true);
// the A records observed on the corpus customer domains
assert.equal(vercel.check_for_vercel_ip("64.239.109.1"), true);   // vercel.com, turbo.build
assert.equal(vercel.check_for_vercel_ip("216.150.16.193"), true); // rauno.me, leerob.io
assert.equal(vercel.check_for_vercel_ip("216.198.79.67"), true);  // vercel.app
assert.equal(vercel.check_for_vercel_ip("66.33.60.129"), true);   // vercel-docs.vercel.sh

// neighbours of the Vercel blocks are owned by other providers
assert.equal(vercel.check_for_vercel_ip("64.239.108.1"), false);
assert.equal(vercel.check_for_vercel_ip("64.239.110.1"), false);
assert.equal(vercel.check_for_vercel_ip("64.239.124.1"), false);
assert.equal(vercel.check_for_vercel_ip("66.33.61.1"), false);
assert.equal(vercel.check_for_vercel_ip("76.76.22.1"), false);
assert.equal(vercel.check_for_vercel_ip("216.150.0.1"), false);
assert.equal(vercel.check_for_vercel_ip("216.150.17.1"), false);
assert.equal(vercel.check_for_vercel_ip("216.198.80.1"), false);
assert.equal(vercel.check_for_vercel_ip("216.230.85.1"), false);
assert.equal(vercel.check_for_vercel_ip("155.120.0.1"), false);
assert.equal(vercel.check_for_vercel_ip("155.122.0.1"), false);
assert.equal(vercel.check_for_vercel_ip("64.29.18.1"), false);
// other providers
assert.equal(vercel.check_for_vercel_ip("1.2.3.4"), false);
assert.equal(vercel.check_for_vercel_ip("104.16.1.1"), false);
assert.equal(vercel.check_for_vercel_ip("185.199.108.1"), false);
assert.equal(vercel.check_for_vercel_ip("192.0.66.1"), false);
assert.equal(vercel.check_for_vercel_ip(null), false);
assert.equal(vercel.check_for_vercel_ip("not-an-ip"), false);

// ---------------------------------------------------------------------------
// Live DNS checks.
//
// Only Vercel-controlled names are asserted live. Customer sites (rauno.me,
// turbo.build, shadcn.com, ...) are documented statically above but are never
// queried here: they can move off Vercel and would rot the suite.
// Set LIVE_TLS=1 to additionally verify the cdn1 prefix still completes a
// verified TLS handshake for the owned set (the strongest regression check).
// ---------------------------------------------------------------------------
var resolver = new dns.Resolver();
resolver.setServers(["2606:4700:4700::1001"]);

var IPV6_PREFIX = "2607:db00:";

function isVercelIpv6(address) {
  return typeof address === "string" && address.indexOf(IPV6_PREFIX) === 0;
}

function resolve4(name) {
  return new Promise(function (resolve, reject) {
    resolver.resolve4(name, function (err, addresses) {
      if (err) reject(new Error(name + ": " + err.code));
      else resolve(addresses);
    });
  });
}

function resolve6(name) {
  return new Promise(function (resolve, reject) {
    resolver.resolve6(name, function (err, addresses) {
      if (err) reject(new Error(name + ": " + err.code));
      else resolve(addresses);
    });
  });
}

function resolveCname(name) {
  return new Promise(function (resolve, reject) {
    resolver.resolveCname(name, function (err, addresses) {
      if (err) reject(new Error(name + ": " + err.code));
      else resolve(addresses);
    });
  });
}

function tlsHandshake(host, servername) {
  return new Promise(function (resolve, reject) {
    var socket = tls.connect({
      host: host,
      port: 443,
      servername: servername,
      rejectUnauthorized: true
    }, function () {
      var authorized = socket.authorized;
      socket.end();
      if (authorized) resolve();
      else reject(new Error("TLS not authorized for " + servername + " on " + host));
    });
    socket.setTimeout(10000, function () {
      socket.destroy();
      reject(new Error("TLS timeout for " + servername + " on " + host));
    });
    socket.on("error", reject);
  });
}

async function liveChecks() {
  // 1. The v6 address we hand out must live inside Vercel's block.
  var v6 = await new Promise(function (resolve, reject) {
    vercel.getvercelv6address(resolver, {
      getItem: function () { return null; },
      setItem: function () {}
    }, function (err, addresses) {
      if (err) reject(err);
      else resolve(addresses);
    });
  });
  assert.ok(v6 && v6.length > 0, "getvercelv6address returned no addresses");
  assert.ok(isVercelIpv6(v6[0]), "expected 2607:db00:: address, got " + v6[0]);

  // 2. Every dualstack rewrite target must resolve, otherwise it is useless.
  //    No AAAA is asserted: the dualstack endpoints carry none yet.
  var rewriteTargets = CORPUS.filter(function (row) {
    return typeof row[3] === "string";
  }).map(function (row) { return row[3]; });

  for (var i = 0; i < rewriteTargets.length; i++) {
    var addresses = await resolve4(rewriteTargets[i]);
    assert.ok(addresses.length > 0, "dualstack target " + rewriteTargets[i] + " has no A record");
  }

  // 3. Owned names resolve into Vercel ranges via A.
  var owned = ["vercel.com", "nextjs.org", "www.nextjs.org"];
  for (var j = 0; j < owned.length; j++) {
    var a = await resolve4(owned[j]);
    assert.ok(a.length > 0, owned[j] + " has no A record");
    a.forEach(function (ip) {
      assert.ok(vercel.check_for_vercel_ip(ip), "unexpected A record for " + owned[j] + ": " + ip);
    });
  }

  // 4. cdn1.vercel.com still points at the host that publishes the v6 block.
  var cname = await resolveCname("cdn1.vercel.com");
  assert.ok(cname.indexOf("cdn1.vercel-dns.com") !== -1, "cdn1.vercel.com CNAME changed: " + cname.join(","));

  // 5. Optional: the prefix must still serve the owned set over TLS.
  if (process.env.LIVE_TLS === "1") {
    for (var k = 0; k < v6.length; k++) {
      await tlsHandshake(v6[k], "vercel.com");
    }
    await tlsHandshake(v6[0], "nextjs.org");
    await assert.rejects(tlsHandshake(v6[0], "vercel.sh"));
  }
}

liveChecks().then(function () {
  console.log("All Tests Passed");
}).catch(function (err) {
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
});
