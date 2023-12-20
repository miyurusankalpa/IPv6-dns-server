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
    check_for_cloudflare_hostname: function (hostname) {
        if (!hostname) return false;
        var sdomains = hostname.split(".");
        sdomains.reverse();
        var dp1 = sdomains.indexOf("net");
        var dp2 = sdomains.indexOf("cloudflare");
        var dp3 = sdomains.indexOf("cdn");

        if (dp1 === 0 && dp2 == 1 && dp3 == 2) {
            //console.log("cloudflare matched");
            var fixedhostname = sdomains.reverse().join(".");
            return fixedhostname;
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
