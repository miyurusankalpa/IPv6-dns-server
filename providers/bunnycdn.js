module.exports = {
  getbunnycdnv6address: function (resolver, localStorageMemory, callback) {
    var aaaa_bunny_domain = "bunnyfonts.b-cdn.net";
    var bunny_fixed_address = "2400:52e0:1e01::883:1";
    var CACHE_KEY = "bunnycdnv6addy";

    var v6adddy = localStorageMemory.getItem(CACHE_KEY);
    if (v6adddy) {
      setImmediate(() => callback(null, v6adddy));
      return;
    }

    resolver.resolve6(aaaa_bunny_domain, (err, addresses) => {
      var result = (err || !addresses || !addresses[0]) ? bunny_fixed_address : addresses[0];
      localStorageMemory.setItem(CACHE_KEY, result);
      callback(null, result);
    });
  },
  check_for_bunnycdn_hostname: function (hostname) {
    if (!hostname) return false;
    var sdomains = hostname.split(".");
    sdomains.reverse();
    var dp1 = sdomains.indexOf("net");
    var dp2 = sdomains.indexOf("b-cdn");

    if (dp1 === 0 && dp2 == 1) {
      //console.log("bunnycdn matched");
      return true;
    } else return false;
  },
};
