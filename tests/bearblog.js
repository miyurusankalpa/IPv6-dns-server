var assert = require('assert');
var bearblog = require('../providers/bearblog');

// check_for_bearblog_ip
assert.equal(bearblog.check_for_bearblog_ip("159.223.204.176"), true);
assert.equal(bearblog.check_for_bearblog_ip("159.223.204.177"), false);
assert.equal(bearblog.check_for_bearblog_ip("1.2.3.4"), false);
assert.equal(bearblog.check_for_bearblog_ip(null), false);

console.log("All Tests Passed");
