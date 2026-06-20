var assert = require('assert');
var wpvip = require('../providers/wpvip');

// check_for_wordpressvip_ip
assert.equal(wpvip.check_for_wordpressvip_ip("192.0.66.1"), true);
assert.equal(wpvip.check_for_wordpressvip_ip("192.0.66.255"), true);
assert.equal(wpvip.check_for_wordpressvip_ip("192.0.67.1"), false);
assert.equal(wpvip.check_for_wordpressvip_ip("1.2.3.4"), false);
assert.equal(wpvip.check_for_wordpressvip_ip(null), false);

// wpvipv4to6
assert.equal(wpvip.wpvipv4to6("192.0.66.1"), "2a04:fa87:fffd::c000:4201");
assert.equal(wpvip.wpvipv4to6("10.0.0.1"), "2a04:fa87:fffd::0a00:0001");
assert.equal(wpvip.wpvipv4to6("255.255.255.255"), "2a04:fa87:fffd::ffff:ffff");
assert.equal(wpvip.wpvipv4to6(null), false);

console.log("All Tests Passed");
