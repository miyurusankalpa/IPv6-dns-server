var assert = require('assert');
var cdn77 = require('../providers/cdn77');

// check_for_cdn77_a
assert.equal(cdn77.check_for_cdn77_a("admin.cdn77.com"), true);
assert.equal(cdn77.check_for_cdn77_a("ns1.example.com"), false);
assert.equal(cdn77.check_for_cdn77_a(null), false);

// check_for_cdn77_hostname
assert.equal(cdn77.check_for_cdn77_hostname("example.cdn77.org"), true);
assert.equal(cdn77.check_for_cdn77_hostname("cdn.cdn77.org"), true);
assert.equal(cdn77.check_for_cdn77_hostname("cdn77.org"), true);
assert.equal(cdn77.check_for_cdn77_hostname("example.cdn77.com"), false);
assert.equal(cdn77.check_for_cdn77_hostname(null), false);

console.log("All Tests Passed");
