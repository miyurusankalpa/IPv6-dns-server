var assert = require('assert');

var fastly = require('../providers/fastly');

assert.equal(fastly.check_for_fastly_hostname("reddit.map.fastly.net"), "dualstack.reddit.map.fastly.net");

//fastly test
assert.equal(fastly.getV6HexFromIPv4(["151.101.1.140"],"fastly"), "396"); //reddit ipv4
assert.equal(fastly.getV6HexFromIPv4(["199.232.192.204"],"fastly"), "204"); //dualstack.nonssl.us-eu.fastly.net
assert.equal(fastly.getV6HexFromIPv4(["199.232.39.52"],"fastly"), "820"); //dms-fsly.sb.lnkdns.net
assert.equal(fastly.getV6HexFromIPv4(["146.75.43.7"],"fastly"), "775"); //some ghost based blogs
assert.equal(fastly.getV6HexFromIPv4(["146.75.31.52"],"fastly"), "820"); //dms-fsly.sb.lnkdns.net
assert.equal(fastly.getV6HexFromIPv4(["146.75.47.42"],"fastly"), "810"); //atc.spotify.map.fastly.net.
assert.equal(fastly.getV6HexFromIPv4(["146.75.107.42"],"fastly"), "810"); //atc.spotify.map.fastly.net.
assert.equal(fastly.getV6HexFromIPv4(["146.75.93.188"],"fastly"), "444"); //vtg.cbsi.map.fastly.net

//github tests
assert.equal(fastly.getV6HexFromIPv4(["185.199.111.133"],"github"), "133");
assert.equal(fastly.getV6HexFromIPv4(["185.199.110.133"],"github"), "133");
assert.equal(fastly.getV6HexFromIPv4(["185.199.109.133"],"github"), "133");
assert.equal(fastly.getV6HexFromIPv4(["185.199.108.133"],"github"), "133");

console.log("All Tests Passed")

