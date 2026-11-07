var assert = require('assert');
var imperva = require('../providers/imperva');

// check_for_imperva_hostname
assert.equal(imperva.check_for_imperva_hostname("hj3lwdh.ng.impervadns.net"), true);
assert.equal(imperva.check_for_imperva_hostname("jq5o3.x.incapdns.net"), true);
assert.equal(imperva.check_for_imperva_hostname("HJ3LWDH.NG.IMPERVADNS.NET."), true);
assert.equal(imperva.check_for_imperva_hostname("impervadns.net"), false);
assert.equal(imperva.check_for_imperva_hostname("notincapdns.net"), false);
assert.equal(imperva.check_for_imperva_hostname("www.singersl.com"), false);
assert.equal(imperva.check_for_imperva_hostname("incapdns.net.example.com"), false);
assert.equal(imperva.check_for_imperva_hostname(null), false);
assert.equal(imperva.check_for_imperva_hostname(undefined), false);

// check_for_imperva_ip
assert.equal(imperva.check_for_imperva_ip("45.60.49.4"), true);
assert.equal(imperva.check_for_imperva_ip("107.154.247.139"), true);
assert.equal(imperva.check_for_imperva_ip("192.230.122.2"), true);
assert.equal(imperva.check_for_imperva_ip("45.223.82.101"), true);
assert.equal(imperva.check_for_imperva_ip("199.83.135.29"), true);
assert.equal(imperva.check_for_imperva_ip("45.61.0.1"), false);
assert.equal(imperva.check_for_imperva_ip("8.8.8.8"), false);
assert.equal(imperva.check_for_imperva_ip(null), false);
assert.equal(imperva.check_for_imperva_ip(undefined), false);

// getv6addresses - last octet hex + PoP table
assert.deepEqual(imperva.getv6addresses("45.60.195.194"), ["2a02:e981:2a::c2", "2a02:e981:32::c2"]);
assert.deepEqual(imperva.getv6addresses("45.60.66.176"), ["2a02:e980:f4::b0"]);
assert.deepEqual(imperva.getv6addresses("192.230.122.2"), ["2a02:e980:5::2"]);
assert.deepEqual(imperva.getv6addresses("192.230.123.1"), ["2a02:e980:6::1"]);
assert.deepEqual(imperva.getv6addresses("45.223.82.101"), ["2a02:e980:226::65"]);
assert.deepEqual(imperva.getv6addresses("107.154.212.27"), ["2a02:e980:53::1b"]);
assert.deepEqual(imperva.getv6addresses("45.60.36.21"), ["2a02:e980:d5::15"]);
assert.deepEqual(imperva.getv6addresses("107.154.247.139"), ["2a02:e980:51::8b"]);
assert.deepEqual(imperva.getv6addresses("107.154.84.252"), ["2a02:e980:5d::fc", "2a02:e980:65::fc"]);
assert.equal(imperva.getv6addresses("45.60.104.21").indexOf("2a02:e980:11b::15") !== -1, true);
assert.equal(imperva.getv6addresses("45.60.104.21").indexOf("2a02:e980:d1::15") !== -1, true);
assert.equal(imperva.getv6addresses("45.60.104.21").indexOf("2a02:e980:d3::15") !== -1, true);

// unknown /24 falls back to the default PoP, host part still preserved
assert.deepEqual(imperva.getv6addresses("45.60.49.4"), ["2a02:e980:f4::4"]);
assert.deepEqual(imperva.getv6addresses("131.125.128.255"), ["2a02:e980:f4::ff"]);
assert.deepEqual(imperva.getv6addresses("not-an-ip"), []);

// getdefaultv6address
assert.equal(imperva.getdefaultv6address(), "2a02:e980:f4::b0");

console.log("All Tests Passed");
