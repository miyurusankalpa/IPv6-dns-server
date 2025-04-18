module.exports = {
  check_for_alicdn_hostname: function (hostname) {
    if (!hostname) return false;
    var sdomains = hostname.split(".");
    sdomains.reverse();
    var dp1 = sdomains.indexOf("com");
    var dp2 = sdomains.indexOf("alicdn");

    if (dp1 === 0 && dp2 == 1) {
      //console.log("alicdn matched");
      return true;
    } else return false;
  },
  getalicdnv6address: function (resolver, localStorageMemory) {
    //ipv6 enabled alicdn domain
    var aaaa_alicdn_domain = "t.alicdn.com";
    var v6addy = localStorageMemory.getItem("alicdnv6addy");

    if (!v6addy) {
      //console.log("not cached");
      resolver.resolve6(aaaa_alicdn_domain, (err, addresses) => {
        if (err) {
          console.log(err);
          return;
        }
        var v6addy = addresses[0].slice(0, -4);
        localStorageMemory.setItem("alicdnv6addy", addresses[0]);
        return v6addy;
      });
    } else return v6addy;
  },
};
