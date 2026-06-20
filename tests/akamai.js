var assert = require('assert');
var akamai = require('../providers/akamai');

// check_for_akamai_hostname - standard akamaiedge
assert.equal(akamai.check_for_akamai_hostname("a1234.akamaiedge.net"), "dsca1234.akamaiedge.net");
assert.equal(akamai.check_for_akamai_hostname("e1234.akamaiedge.net"), "dsce1234.akamaiedge.net");

// check_for_akamai_hostname - akamai.net
assert.equal(akamai.check_for_akamai_hostname("a1234.akamai.net"), "dsca1234.akamai.net");

// check_for_akamai_hostname - cj prefix (3-part: foo.cj.akamaiedge.net)
assert.equal(akamai.check_for_akamai_hostname("foo.cj.akamaiedge.net"), "foo.dscj.akamaiedge.net");

// check_for_akamai_hostname - non-matching
assert.equal(akamai.check_for_akamai_hostname("example.com"), false);
assert.equal(akamai.check_for_akamai_hostname("example.cloudflare.net"), false);
assert.equal(akamai.check_for_akamai_hostname("example.akamai.com"), false);
assert.equal(akamai.check_for_akamai_hostname(null), false);
assert.equal(akamai.check_for_akamai_hostname(undefined), false);

console.log("All Tests Passed");
