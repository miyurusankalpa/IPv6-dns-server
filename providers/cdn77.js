module.exports = {
    check_for_cdn77_a: function (authority) {
        //console.log('a', authority);
        if (!authority) return false;
        if (authority == 'cdn77.org') {
            //console.log("cdn77 matched");
            return true;
        } else return false;
    },
    check_for_cdn77_hostname: function (hostname) {
        if (!hostname) return false;
        var sdomains = hostname.split(".");
        sdomains.reverse();
        var dp1 = sdomains.indexOf("org");
        var dp2 = sdomains.indexOf("cdn77");

        if (dp1 === 0 && dp2 == 1) {
            //console.log("cdn77 matched");
            //var fixedhostname = sdomains.reverse().join(".");
            return hostname;
        } else return false;
    },
    get_cdn77_v6address: function (resolver, localStorageMemory) {
        var aaaa_cdn77_domain = 'www.cdn77.com';
        var v6adddy = localStorageMemory.getItem('cdn77v6addy');

        if (!v6adddy) {
            //console.log("not cached");
            resolver.resolve6(aaaa_bunny_domain, (err, addresses) => {
                if (err) { console.log(err); }
                var v6adddy = addresses[0];
                localStorageMemory.setItem('cdn77v6addy', v6adddy);
                return v6adddy;
            });

        } else return v6adddy;
    }
};
