var ipRangeCheck = require("ip-range-check");

module.exports = {
    check_for_cloudflare_a: function (authority) {
        //console.log('a', authority);
        if (!authority) return false;
        if (authority == 'dns.cloudflare.com') {
            //console.log("cloudflare matched");
            return true;
        } else return false;
    },
    check_for_cloudflare_ip: function (ipv4) {
        //console.log('cloudflare ip check', ipv4);
        if (!ipv4) return false;

        return ipRangeCheck(ipv4, "104.16.0.0/12");
    },
    getcloudflarev6address: function () {
        return '2606:4700::6810:bad'; //will give SSL_ERROR_NO_CYPHER_OVERLAP on non cloudflare sites on aggressive mode
    },
};
