var assert = require('assert');
var msedge = require('../providers/msedge');

// check_for_microsoftedge_a
assert.equal(msedge.check_for_microsoftedge_a("a-0001.msedge.net"), true);
assert.equal(msedge.check_for_microsoftedge_a("b-0001.msedge.net"), true);
assert.equal(msedge.check_for_microsoftedge_a("ns1.example.com"), false);
assert.equal(msedge.check_for_microsoftedge_a(null), false);

// msev4tov6 - various prefix groups
assert.equal(msedge.msev4tov6(["13.107.5.89"], "a-0001.msedge.net"), "2620:1ec:c11::89");
assert.equal(msedge.msev4tov6(["13.107.5.89"], "b-0001.msedge.net"), "2620:1ec:a92::89");
assert.equal(msedge.msev4tov6(["13.107.5.89"], "c-0001.msedge.net"), "2a01:111:2003::89");
assert.equal(msedge.msev4tov6(["13.107.5.89"], "l-0001.msedge.net"), "2620:1ec:21::89");
assert.equal(msedge.msev4tov6(["13.107.5.89"], "s-0001.msedge.net"), "2620:1ec:6::89");
assert.equal(msedge.msev4tov6(["13.107.5.89"], "k-0001.msedge.net"), "2620:1ec:c::89");
assert.equal(msedge.msev4tov6(["13.107.5.89"], "t-0001.msedge.net"), "2620:1ec:bdf::89");

// msev4tov6 - spo prefix (special octet mapping)
assert.equal(msedge.msev4tov6(["13.107.5.9"], "spo-0001.msedge.net"), "2620:1ec:8f8::8");
assert.equal(msedge.msev4tov6(["13.107.5.42"], "spo-0001.msedge.net"), "2620:1ec:8f8::42");

// msev4tov6 - unknown prefix
assert.equal(msedge.msev4tov6(["13.107.5.89"], "x-0001.msedge.net"), undefined);

// msev4tov6 - edge cases
assert.equal(msedge.msev4tov6([], "a-0001.msedge.net"), false);
assert.equal(msedge.msev4tov6(null, "a-0001.msedge.net"), false);

console.log("All Tests Passed");
