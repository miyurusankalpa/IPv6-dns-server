var ipRangeCheck = require("ip-range-check");

module.exports = {
    getfastlyv6address: function (customer, resolver, localStorageMemory) {
        if (customer == "github") return "2606:50c0:8000::";

        var aaaa_fastly_domain = 'dualstack.g.shared.global.fastly.net';
        var v6range = localStorageMemory.getItem('fastlyv6range');

        if (!v6range) {
            //console.log("not cached");
            resolver.resolve6(aaaa_fastly_domain, (err, addresses) => {
                if (err) { console.log(err); return; }
                var v6range = addresses[0].slice(0, -3);
                //console.log(v6range);
                localStorageMemory.setItem('fastlyv6range', v6range);
                return v6range;
            });
        } else return v6range;
    },
    fastlyv4tov6: function (ipv4) {
        //console.log('f', ipv4);
        if (!ipv4 || !ipv4[0]) return false;

        if (module.exports.check_for_fastly_ip(ipv4[0])) var cust = "fastly";
        if (module.exports.check_for_githubpages_ip(ipv4[0])) var cust = "github";

        if (!cust) return false;

        var octets = ipv4[0].split(".");

        //'last octets', octets[3]);

        var v6_range = module.exports.getfastlyv6address(cust);
        var v6hex;

        if (octets[0] == "151") {
            if (ipv4.length == 1) {
                v6hex = ((octets[2] % 4) * 256 + (octets[3] * 1));
            } else {
                v6hex = ((octets[2] % 64) * 256 + (octets[3] * 1)); //huge thanks @tambry for this expression
            }
        } else v6hex = octets[3];

        return v6_range + v6hex;
    },
    check_for_fastly_a: function (authority) {
        //console.log('a', authority);
        if (!authority) return false;
        if (authority == 'hostmaster.fastly.com') {
            //console.log("fastly matched");
            return true;
        } else return false;
    },
    check_for_fastly_hostname: function (hostname) {
        if (!hostname) return false;
        var sdomains = hostname.split(".");
        sdomains.reverse();
        var dp1 = sdomains.indexOf("net");
        var dp2 = sdomains.indexOf("fastly");
        var dp3 = sdomains.indexOf("fastlylb");

        if (dp1 === 0 && (dp2 == 1 || dp3 == 1)) {
            if (sdomains.length == 4) sdomains[4] = "dualstack";
            //console.log("fastly matched");
            var fixedhostname = sdomains.reverse().join(".");
            return fixedhostname;
        } else return false;
    },
    check_for_fastly_ip: function (ipv4) {
        //console.log('fastly ip check', ipv4);
        if (!ipv4) return false;

        return ipRangeCheck(ipv4, ["151.101.0.0/16", "199.232.0.0/16"]);
    },
    check_for_githubpages_ip: function (ipv4) {
        //console.log('githubio ip check', ipv4);
        if (!ipv4) return false;

        if (!ipRangeCheck(ipv4, "185.199.108.0/22")) return false;

        /*var octets = ipv4.split(".");
        if (octets[3] == 153) return true;
        else return false;*/
        return true;
    },
    check_for_stackexchange_ip: function (ipv4) {
        if (!ipv4) return false;

        var octets = ipv4.split(".");
        if (octets[3] == 69) return true;
        else return false;
    }
};
