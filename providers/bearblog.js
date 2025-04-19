var ipRangeCheck = require("ip-range-check");

module.exports = {
  getbearblogv6address: function (resolver, localStorageMemory) {
    var aaaa_bearblog_domain = "domain-proxy.bearblog.dev";
    var v6adddy = localStorageMemory.getItem("bearblogv6addy");

    if (!v6adddy) {
      //console.log("not cached");
      try {
        resolver.resolve6(aaaa_bearblog_domain, (err, addresses) => {
          var v6adddy = addresses[0];
          //if (typeof bv6address == "undefined")
          localStorageMemory.setItem("bearblogv6addy", v6adddy);
          return v6adddy;
        });
      } catch (error) {
        //console.error(error);
      }
    } else return v6adddy;
  },
  check_for_bearblog_ip: function (ipv4) {
    //console.log("bearblog ip check", ipv4);
    if (!ipv4) return false;

    return ipRangeCheck(ipv4, ["159.223.204.176/32"]);
  },
};
