var ipRangeCheck = require("ip-range-check");

module.exports = {
  check_for_sucuri_ip: function (ipv4) {
    //console.log('sucuri ip check', ipv4);
    if (!ipv4) return false;

    return ipRangeCheck(ipv4, "192.124.249.0/24");
  },
  getsucuriv6address: function (resolver, localStorageMemory, callback) {
    //sucuri ipv6 enabled domain
    var aaaa_sucuri_domain = "sucuri.net";
    const CACHE_KEY = "sucuriv6range";

    // Check cache first
    const cachedV6List = localStorageMemory.getItem(CACHE_KEY);
    if (cachedV6List) {
      const addresses = Array.isArray(cachedV6List) ? cachedV6List : JSON.parse(cachedV6List);
      // Call callback asynchronously to maintain consistent behavior
      setImmediate(() => callback(null, addresses));
      return;
    }

    // Resolve IPv6 addresses
    resolver.resolve6(aaaa_sucuri_domain, (err, addresses) => {
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
};
