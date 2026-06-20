var assert = require('assert');
var bunnycdn = require('../providers/bunnycdn');

// check_for_bunnycdn_hostname
assert.equal(bunnycdn.check_for_bunnycdn_hostname("example.b-cdn.net"), true);
assert.equal(bunnycdn.check_for_bunnycdn_hostname("cdn123.b-cdn.net"), true);
assert.equal(bunnycdn.check_for_bunnycdn_hostname("b-cdn.net"), true);
assert.equal(bunnycdn.check_for_bunnycdn_hostname("example.cloudflare.net"), false);
assert.equal(bunnycdn.check_for_bunnycdn_hostname("example.b-cdn.com"), false);
assert.equal(bunnycdn.check_for_bunnycdn_hostname(null), false);
assert.equal(bunnycdn.check_for_bunnycdn_hostname(undefined), false);

console.log("All Tests Passed");
