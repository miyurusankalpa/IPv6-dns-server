module.exports = {
    check_for_v0cdn_hostname: function (hostname) {
        if (!hostname) return false;
        var sdomains = hostname.split(".");
        sdomains.reverse();
        var dp1 = sdomains.indexOf("net");
        var dp2 = sdomains.indexOf("v0cdn");

        if (dp1 === 0 && dp2 == 1) {
            //console.log("v0cdn matched");
            sdomains[3] = 'cs21';
            var fixedhostname = sdomains.reverse().join(".");
            return fixedhostname;
        } else return false;
    },

};
