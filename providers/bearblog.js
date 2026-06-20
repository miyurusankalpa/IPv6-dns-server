var ipRangeCheck = require("ip-range-check");

module.exports = {
  getbearblogv6address: function (resolver, localStorageMemory, callback) {
    var aaaa_bearblog_domain = "domain-proxy.bearblog.dev";
    const CACHE_KEY = "bearblogv6addy";

    // Check cache first
    const cachedV6List = localStorageMemory.getItem(CACHE_KEY);
    if (cachedV6List) {
      const addresses = Array.isArray(cachedV6List) ? cachedV6List : JSON.parse(cachedV6List);
      // Call callback asynchronously to maintain consistent behavior
      setImmediate(() => callback(null, addresses));
      return;
    }

    // Resolve IPv6 addresses
    resolver.resolve6(aaaa_bearblog_domain, (err, addresses) => {
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
  check_for_bearblog_ip: function (ipv4) {
    //console.log("bearblog ip check", ipv4);
    if (!ipv4) return false;

    return ipRangeCheck(ipv4, ["159.223.204.176/32"]);
  },
};
