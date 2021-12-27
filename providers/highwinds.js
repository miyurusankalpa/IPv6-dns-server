module.exports = {
    check_for_highwinds_hostname: function (hostname) {
        if (!hostname) return false;
        var sdomains = hostname.split(".");
        sdomains.reverse();
        var dp1 = sdomains.indexOf("net");
        var dp2 = sdomains.indexOf("hwcdn");
        var dp3 = sdomains.indexOf("com");
        var dp4 = sdomains.indexOf("stackpathcdn");

        if ((dp1 === 0 && dp2 == 1) || (dp3 === 0 && dp4 == 1)) {
            //console.log("highwinds matched");
            var fixedhostname = sdomains.reverse().join(".");
            return fixedhostname;
        } else return false;
    },
    gethighwindv6address: function () {
        return '2001:4de0:ac19::1:b:2a';
    }
};
