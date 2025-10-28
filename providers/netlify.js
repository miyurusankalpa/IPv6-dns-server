var ipRangeCheck = require("ip-range-check");

module.exports = {
  getnetlifyv6address: function (resolver, localStorageMemory, callback) {
    var aaaa_netlify_domain = "www.netlify.com";
    const CACHE_KEY = "netlifyv6addy";

    // Check cache first
    const cachedV6List = localStorageMemory.getItem(CACHE_KEY);
    if (cachedV6List) {
      const addresses = Array.isArray(cachedV6List) ? cachedV6List : JSON.parse(cachedV6List);
      // Call callback asynchronously to maintain consistent behavior
      setImmediate(() => callback(null, addresses));
      return;
    }

    // Resolve IPv6 addresses
    resolver.resolve6(aaaa_netlify_domain, (err, addresses) => {
      if (err) {
        console.error("Failed to resolve IPv6 addresses:", err);
        callback(err, []);
        return;
      }

      // Cache the result
      localStorageMemory.setItem(CACHE_KEY, JSON.stringify(addresses));
      callback(null, addresses);
    });
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
