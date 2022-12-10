module.exports = {
    getbunnycdnv6address: function (resolver, localStorageMemory) {
        //crtlblog ipv6 enabled domain
        var aaaa_bunny_domain = 'ctrl.b-cdn.net';
        var v6adddy = localStorageMemory.getItem('bunnycdnv6addy');
        var bunny_fixed_address = '2400:52e0:1e01::883:1'; //bunnycdn AMS POP IP

        if (!v6adddy) {
            //console.log("not cached");
            try {
                resolver.resolve6(aaaa_bunny_domain, (err, addresses) => {
                    if (err) { console.log(err); return bunny_fixed_address; }
                    var v6adddy = addresses[0];
                    if (typeof bv6address == 'undefined') v6adddy = bunny_fixed_address;
                    localStorageMemory.setItem('bunnycdnv6addy', v6adddy);
                    return v6adddy;
                });
            } catch (error) {
                //console.error(error);
                var v6adddy = bunny_fixed_address;
            }
        } else return v6adddy;
    },
    check_for_bunnycdn_hostname: function (hostname) {
        if (!hostname) return false;
        var sdomains = hostname.split(".");
        sdomains.reverse();
        var dp1 = sdomains.indexOf("net");
        var dp2 = sdomains.indexOf("b-cdn");

        if (dp1 === 0 && dp2 == 1) {
            //console.log("bunnycdn matched");
            var fixedhostname = sdomains.reverse().join(".");
            return fixedhostname;
        } else return false;
    }
};
