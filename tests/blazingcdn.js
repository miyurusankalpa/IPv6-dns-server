var assert = require('assert');
var blazingcdn = require('../providers/blazingcdn');

// check_for_blazingcdn_hostname
assert.equal(blazingcdn.check_for_blazingcdn_hostname("example.blazingcdn.net"), true);
assert.equal(blazingcdn.check_for_blazingcdn_hostname("cdn59455242.blazingcdn.net"), true);
assert.equal(blazingcdn.check_for_blazingcdn_hostname("blazingcdn.com"), false);
assert.equal(blazingcdn.check_for_blazingcdn_hostname("example.com"), false);
assert.equal(blazingcdn.check_for_blazingcdn_hostname(null), false);
assert.equal(blazingcdn.check_for_blazingcdn_hostname(undefined), false);

console.log("All Tests Passed");
