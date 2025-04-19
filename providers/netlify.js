var ipRangeCheck = require("ip-range-check");

module.exports = {
  getnetlifyv6address: function (resolver, localStorageMemory) {
    var aaaa_netlify_domain = "www.netlify.com";
    var v6adddy = localStorageMemory.getItem("netlifyv6addy");

    if (!v6adddy) {
      //console.log("not cached");
      try {
        resolver.resolve6(aaaa_netlify_domain, (err, addresses) => {
          var v6adddy = addresses[0];
          //if (typeof bv6address == "undefined")
          localStorageMemory.setItem("netlifyv6addy", v6adddy);
          return v6adddy;
        });
      } catch (error) {
        //console.error(error);
      }
    } else return v6adddy;
  },
  check_for_netlify_hostname: function (hostname) {
    if (!hostname) return false;
    var sdomains = hostname.split(".");
    sdomains.reverse();
    var dp1 = sdomains.indexOf("com");
    var dp2 = sdomains.indexOf("netlify");

    //console.log(sdomains);

    if (dp1 === 0 && dp2 == 1) {
      console.log("netlify matched");
      return hostname;
    } else return false;
  },
  check_for_netlify_ip: function (ipv4) {
    //console.log("netlify ip check", ipv4);
    if (!ipv4) return false;

    return ipRangeCheck(ipv4, ["75.2.60.5/32", "99.83.231.61/32"]);
  },
};
