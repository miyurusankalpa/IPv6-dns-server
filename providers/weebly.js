var ipRangeCheck = require("ip-range-check");

module.exports = {
    check_for_weebly_ip: function (ipv4) {
        //console.log('weebly ip check', ipv4);
        if (!ipv4) return false;

        return ipRangeCheck(ipv4, "199.34.228.0/22");
    },
    check_for_weebly_hostname: function (hostname) {
        if (!hostname) return false;
        var sdomains = hostname.split(".");
        sdomains.reverse();
        var dp1 = sdomains.indexOf("com");
        var dp2 = sdomains.indexOf("weebly");

        if (dp1 === 0 && dp2 == 1) {
            //console.log("weebly matched");
            var fixedhostname = sdomains.reverse().join(".");
            return fixedhostname;
        } else return false;
    },
    getweeblyv6address: function () {
        return '2620:11c:1:e4::36';
    }
};
