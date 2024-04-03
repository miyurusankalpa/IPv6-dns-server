module.exports = {
    check_for_msidentity_hostname: function (hostname) {
        if (!hostname) return false;
        //console.log(hostname);
        var sdomains = hostname.split(".");
        sdomains.reverse();
        var dp1 = sdomains.indexOf("net");
        var dp2 = sdomains.indexOf("akadns");
        var dp3 = sdomains.indexOf("aadg");
        var dp4 = sdomains.indexOf("prd");
        var dp5 = sdomains.indexOf("a");
        var dp6 = sdomains.indexOf("v4");

        if (dp1 === 0 && dp2 == 1 && dp3 == 2 && dp4 == 3 && dp5 == 4) {
            //console.log("msidentity matched");
            if (dp6 === 5) sdomains[5] = 'v6';
            var fixedhostname = sdomains.reverse().join(".");
            return fixedhostname;
        } else return false;
    },
};
