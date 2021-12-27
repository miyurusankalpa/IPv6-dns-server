module.exports = {
    check_for_akamai_hostname: function (hostname) {
        if (!hostname) return false;
        //console.log(hostname);
        var sdomains = hostname.split(".");
        sdomains.reverse();
        var dp1 = sdomains.indexOf("net");
        var dp2 = sdomains.indexOf("akamaiedge");
        var dp3 = sdomains.indexOf("akamai");
        var dp4 = sdomains.indexOf("cj");

        if (dp1 === 0 && (dp2 == 1 || dp3 == 1)) {
            //console.log("akamai matched");
            if (dp4 === 2) sdomains[2] = 'ds' + sdomains[2];
            else sdomains[2] = 'dsc' + sdomains[2];
            var fixedhostname = sdomains.reverse().join(".");
            return fixedhostname;
        } else return false;
    },
};
