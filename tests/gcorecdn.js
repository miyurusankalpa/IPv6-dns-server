var assert = require('assert');
var gcorecdn = require('../providers/gcorecdn');

// check_for_gcorecdn_hostname
assert.equal(gcorecdn.check_for_gcorecdn_hostname("example.gcdn.co"), true);
assert.equal(gcorecdn.check_for_gcorecdn_hostname("cdn.gcdn.co"), true);
assert.equal(gcorecdn.check_for_gcorecdn_hostname("gcdn.co"), true);
assert.equal(gcorecdn.check_for_gcorecdn_hostname("example.com"), false);
assert.equal(gcorecdn.check_for_gcorecdn_hostname(null), false);
assert.equal(gcorecdn.check_for_gcorecdn_hostname(undefined), false);

console.log("All Tests Passed");
