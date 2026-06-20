var assert = require('assert');
var awsglb = require('../providers/awsglobalaccelerator');

// check_for_awsglb_hostname
assert.equal(awsglb.check_for_awsglb_hostname("abc.awsglobalaccelerator.com"), "abc.dualstack.awsglobalaccelerator.com");
assert.equal(awsglb.check_for_awsglb_hostname("1234.awsglobalaccelerator.com"), "1234.dualstack.awsglobalaccelerator.com");
assert.equal(awsglb.check_for_awsglb_hostname("dualstack.awsglobalaccelerator.com"), "dualstack.awsglobalaccelerator.com");
assert.equal(awsglb.check_for_awsglb_hostname("example.com"), false);
assert.equal(awsglb.check_for_awsglb_hostname(null), false);
assert.equal(awsglb.check_for_awsglb_hostname(undefined), false);

console.log("All Tests Passed");
