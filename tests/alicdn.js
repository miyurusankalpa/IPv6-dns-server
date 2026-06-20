var assert = require('assert');
var alicdn = require('../providers/alicdn');

// check_for_alicdn_hostname
assert.equal(alicdn.check_for_alicdn_hostname("g.alicdn.com"), true);
assert.equal(alicdn.check_for_alicdn_hostname("tbcdn.alicdn.com"), true);
assert.equal(alicdn.check_for_alicdn_hostname("alicdn.com"), true);
assert.equal(alicdn.check_for_alicdn_hostname("example.com"), false);
assert.equal(alicdn.check_for_alicdn_hostname(null), false);
assert.equal(alicdn.check_for_alicdn_hostname(undefined), false);

console.log("All Tests Passed");
