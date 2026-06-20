var assert = require('assert');
var sucuri = require('../providers/sucuri');

// check_for_sucuri_ip
assert.equal(sucuri.check_for_sucuri_ip("192.124.249.1"), true);
assert.equal(sucuri.check_for_sucuri_ip("192.124.249.255"), true);
assert.equal(sucuri.check_for_sucuri_ip("192.124.250.1"), false);
assert.equal(sucuri.check_for_sucuri_ip("10.0.0.1"), false);
assert.equal(sucuri.check_for_sucuri_ip(null), false);

console.log("All Tests Passed");
