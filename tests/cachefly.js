var assert = require("assert");

var cachefly = require("../providers/cachefly");

assert.equal(
  cachefly.check_for_cachefly_hostname("rvip1.g.cachefly.net"),
  "rvip1-dstack.g.cachefly.net"
);
assert.equal(
  cachefly.check_for_cachefly_hostname("vip1.g-anycast1.cachefly.net"),
  "rvip1-dstack.g.cachefly.net"
);
assert.equal(
  cachefly.check_for_cachefly_hostname("rvip33.g.cachefly.net"),
  "rvip33-dstack.g.cachefly.net"
);
assert.equal(
  cachefly.check_for_cachefly_hostname("rvip1.ap.cachefly.net"),
  "rvip1-dstack.ap.cachefly.net"
);
assert.equal(
  cachefly.check_for_cachefly_hostname("vip9.eu-west.cachefly.net"),
  "rvip9-dstack.eu-west.cachefly.net"
);
assert.equal(
  cachefly.check_for_cachefly_hostname("cachefly.cachefly.net"),
  false
);
assert.equal(cachefly.check_for_cachefly_hostname("www.cachefly.com"), false);

assert.equal(cachefly.check_for_cachefly_ip("205.234.175.42"), true);
assert.equal(cachefly.check_for_cachefly_ip("205.234.176.42"), false);

assert.equal(
  cachefly.cacheflyv4to6("205.234.175.136"),
  "2605:4c40::175:136"
);

console.log("All Tests Passed");
