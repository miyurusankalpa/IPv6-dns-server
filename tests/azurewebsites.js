var assert = require('assert');
var azurewebsites = require('../providers/azurewebsites');

// check_for_azureweb_hostname
assert.equal(azurewebsites.check_for_azureweb_hostname("mysite.azurewebsites.windows.net"), "sip-v4andv6.azurewebsites.windows.net");
assert.equal(azurewebsites.check_for_azureweb_hostname("app.azurewebsites.windows.net"), "sip-v4andv6.azurewebsites.windows.net");
assert.equal(azurewebsites.check_for_azureweb_hostname("example.com"), false);
assert.equal(azurewebsites.check_for_azureweb_hostname("azurewebsites.net"), false);
assert.equal(azurewebsites.check_for_azureweb_hostname(null), false);
assert.equal(azurewebsites.check_for_azureweb_hostname(undefined), false);

console.log("All Tests Passed");
