var assert = require('assert');
var netlify = require('../providers/netlify');

// check_for_netlify_hostname
assert.equal(netlify.check_for_netlify_hostname("mysite.netlify.com"), "mysite.netlify.com");
assert.equal(netlify.check_for_netlify_hostname("app.netlify.com"), "app.netlify.com");
assert.equal(netlify.check_for_netlify_hostname("netlify.app"), false);
assert.equal(netlify.check_for_netlify_hostname("example.com"), false);
assert.equal(netlify.check_for_netlify_hostname(null), false);

// check_for_netlify_ip
assert.equal(netlify.check_for_netlify_ip("75.2.60.5"), true);
assert.equal(netlify.check_for_netlify_ip("99.83.231.61"), true);
assert.equal(netlify.check_for_netlify_ip("1.2.3.4"), false);
assert.equal(netlify.check_for_netlify_ip(null), false);

console.log("All Tests Passed");
