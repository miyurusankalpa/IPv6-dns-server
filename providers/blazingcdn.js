module.exports = {
  getblazingcdnv6address: function (resolver, localStorageMemory) {
    var aaaa_blazing_domain = "cdn59455242.blazingcdn.net"; //https://codeberg.org/IPv6-Monostack/delegacy-rpz/src/commit/48fdd433336cd6009e751677b131bbd1718d5573/dnsconfig.js#L2270
    var v6adddy = localStorageMemory.getItem("blazingcdnv6addy");
    var blazing_fixed_address = "2a02:b48:9000::1"; //blazingcdn anycast IP

    if (!v6adddy) {
      try {
        resolver.resolve6(aaaa_blazing_domain, (err, addresses) => {
          if (err) {
            console.log(err);
            return blazing_fixed_address;
          }
          var v6adddy = addresses[0];
          if (typeof bv6address == "undefined") v6adddy = blazing_fixed_address;
          localStorageMemory.setItem("blazingcdnv6addy", v6adddy);
          return v6adddy;
        });
      } catch (error) {
        var v6adddy = blazing_fixed_address;
      }
    } else return v6adddy;
  },

  check_for_blazingcdn_hostname: function (hostname) {
    if (!hostname) return false;
    var sdomains = hostname.split(".");
    sdomains.reverse();
    var dp1 = sdomains.indexOf("net");
    var dp2 = sdomains.indexOf("blazingcdn");

    if (dp1 === 0 && dp2 == 1) {
      return true;
    } else return false;
  },
};
