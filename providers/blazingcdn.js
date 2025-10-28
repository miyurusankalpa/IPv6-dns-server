module.exports = {
  getblazingcdnv6address: function (resolver, localStorageMemory, callback) {
    const AAAA_BLAZING_DOMAIN = "cdn59455242.blazingcdn.net";
    const CACHE_KEY = "blazingcdnv6addy";
    const BLAZING_FIXED_ADDRESS = "2a02:b48:9000::1"; // BlazingCDN anycast IP

    // Check cache first
    const cachedV6List = localStorageMemory.getItem(CACHE_KEY);
    if (cachedV6List) {
      const addresses = Array.isArray(cachedV6List) ? cachedV6List : JSON.parse(cachedV6List);
      // Call callback asynchronously to maintain consistent behavior
      setImmediate(() => callback(null, addresses));
      return;
    }

    // Resolve IPv6 addresses
    resolver.resolve6(AAAA_BLAZING_DOMAIN, (err, addresses) => {
      if (err) {
        console.error("Failed to resolve IPv6 addresses:", err);
        callback(err, []);
        return;
      }

      localStorageMemory.setItem(CACHE_KEY, JSON.stringify(addresses));
      // If no addresses found, use the fixed address
      if (!addresses || addresses.length === 0) {
        console.warn("No IPv6 addresses found for BlazingCDN, using fallback address.");
        addresses = [BLAZING_FIXED_ADDRESS];
      }
      callback(null, addresses);
    });
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
