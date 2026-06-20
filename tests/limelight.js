var assert = require('assert');
var limelight = require('../providers/limelight');

// check_for_lln_hostname
assert.equal(limelight.check_for_lln_hostname("example.llnwi.net"), "msftstore.example.llnwi.net");
assert.equal(limelight.check_for_lln_hostname("cdn.llnwi.net"), "msftstore.cdn.llnwi.net");
assert.equal(limelight.check_for_lln_hostname("llnwi.com"), false);
assert.equal(limelight.check_for_lln_hostname("example.com"), false);
assert.equal(limelight.check_for_lln_hostname(null), false);
assert.equal(limelight.check_for_lln_hostname(undefined), false);

console.log("All Tests Passed");
