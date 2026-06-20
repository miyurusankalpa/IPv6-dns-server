var assert = require('assert');
var cloudfront = require('../providers/cloudfront');

// check_for_cloudfront_hostname
assert.equal(cloudfront.check_for_cloudfront_hostname("d111111abcdef8.cloudfront.net"), true);
assert.equal(cloudfront.check_for_cloudfront_hostname("static.twitchcdn.net"), false);
assert.equal(cloudfront.check_for_cloudfront_hostname("example.cloudfront.com"), false);
assert.equal(cloudfront.check_for_cloudfront_hostname(null), false);
assert.equal(cloudfront.check_for_cloudfront_hostname(undefined), false);

// check_for_cloudfront_ip - global ranges
assert.equal(cloudfront.check_for_cloudfront_ip("108.156.0.1"), true);
assert.equal(cloudfront.check_for_cloudfront_ip("13.32.0.1"), true);
assert.equal(cloudfront.check_for_cloudfront_ip("99.86.0.1"), true);
assert.equal(cloudfront.check_for_cloudfront_ip("54.192.0.1"), true);
assert.equal(cloudfront.check_for_cloudfront_ip("99.84.0.1"), true);

// check_for_cloudfront_ip - regional ranges
assert.equal(cloudfront.check_for_cloudfront_ip("13.113.196.64"), true);
assert.equal(cloudfront.check_for_cloudfront_ip("3.35.130.128"), true);

// check_for_cloudfront_ip - not cloudfront
assert.equal(cloudfront.check_for_cloudfront_ip("1.2.3.4"), false);
assert.equal(cloudfront.check_for_cloudfront_ip(null), false);

console.log("All Tests Passed");
