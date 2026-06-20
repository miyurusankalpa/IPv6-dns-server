var assert = require('assert');
var edgecast_windows = require('../providers/edgecast_windows');

// check_for_v0cdn_hostname
assert.equal(edgecast_windows.check_for_v0cdn_hostname("example.v0cdn.net"), "cs21.example.v0cdn.net");
assert.equal(edgecast_windows.check_for_v0cdn_hostname("video.v0cdn.net"), "cs21.video.v0cdn.net");
assert.equal(edgecast_windows.check_for_v0cdn_hostname("v0cdn.com"), false);
assert.equal(edgecast_windows.check_for_v0cdn_hostname("example.com"), false);
assert.equal(edgecast_windows.check_for_v0cdn_hostname(null), false);
assert.equal(edgecast_windows.check_for_v0cdn_hostname(undefined), false);

console.log("All Tests Passed");
