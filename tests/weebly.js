var assert = require('assert');
var weebly = require('../providers/weebly');

// check_for_weebly_hostname
assert.equal(weebly.check_for_weebly_hostname("mysite.weebly.com"), true);
assert.equal(weebly.check_for_weebly_hostname("blog.weebly.com"), true);
assert.equal(weebly.check_for_weebly_hostname("weebly.net"), false);
assert.equal(weebly.check_for_weebly_hostname("example.com"), false);
assert.equal(weebly.check_for_weebly_hostname(null), false);

// check_for_weebly_ip
assert.equal(weebly.check_for_weebly_ip("199.34.228.1"), true);
assert.equal(weebly.check_for_weebly_ip("199.34.231.255"), true);
assert.equal(weebly.check_for_weebly_ip("199.34.232.1"), false);
assert.equal(weebly.check_for_weebly_ip("1.2.3.4"), false);
assert.equal(weebly.check_for_weebly_ip(null), false);

// getweeblyv6address
assert.equal(weebly.getweeblyv6address(), "2620:11c:1:e4::36");

console.log("All Tests Passed");
