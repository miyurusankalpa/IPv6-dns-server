var ipRangeCheck = require("ip-range-check");

module.exports = {
    check_for_sucuri_ip: function (ipv4) {
        //console.log('sucuri ip check', ipv4);
        if (!ipv4) return false;

        return ipRangeCheck(ipv4, "192.124.249.0/24");
    },
    getsucuriv6address: function () {
        //sucuri ipv6 enabled domain
        var aaaa_sucuri_domain = 'sucuri.net';
        var v6range = localStorageMemory.getItem('sucuriv6range');

        if (!v6range) {
            //console.log("not cached");
            resolver.resolve6(aaaa_sucuri_domain, (err, addresses) => {
                if (err) { console.log(err); return; }
                var v6range = addresses[0];
                localStorageMemory.setItem('sucuriv6range', v6range);
                return v6range;
            });
        } else return v6range;
    }
};

