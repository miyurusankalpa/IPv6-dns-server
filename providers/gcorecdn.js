module.exports = {
  getgcorecdnv6address: function (resolver, localStorageMemory) {
    // ipv6 enabled domain
    var aaaa_gcore_domain = "d.gcdn.co"; //https://codeberg.org/IPv6-Monostack/delegacy-rpz/src/commit/48fdd433336cd6009e751677b131bbd1718d5573/dnsconfig.js#L2244
    var v6adddy = localStorageMemory.getItem("gcorecdnv6addy");

    if (!v6adddy) {
      try {
      resolver.resolve6(aaaa_gcore_domain, (err, addresses) => {
        if (err || !addresses || addresses.length === 0) {
          //console.log("Failed to resolve IPv6 for", aaaa_gcore_domain, err);
          return false;
        }
        var v6adddy = addresses[0];
        localStorageMemory.setItem("gcorecdnv6addy", v6adddy);
        return v6adddy;
      });
      } catch (error) {
          return false;
      }
    } else return v6adddy;
  },

  check_for_gcorecdn_hostname: function (hostname) {
    if (!hostname) return false;
    var sdomains = hostname.split(".");
    sdomains.reverse();
    var dp1 = sdomains.indexOf("co");
    var dp2 = sdomains.indexOf("gcdn");

    if (dp1 === 0 && dp2 == 1) {
      return true;
    } else return false;
  },
};
