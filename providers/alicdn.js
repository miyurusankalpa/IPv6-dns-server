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
  getalicdnv6address: function (resolver, localStorageMemory, callback) {
    //ipv6 enabled alicdn domain
    var aaaa_alicdn_domain = "t.alicdn.com";
    const CACHE_KEY = "alicdnv6addy";

    // Check cache first
    const cachedV6List = localStorageMemory.getItem(CACHE_KEY);
    if (cachedV6List) {
      const addresses = Array.isArray(cachedV6List) ? cachedV6List : JSON.parse(cachedV6List);
      // Call callback asynchronously to maintain consistent behavior
      setImmediate(() => callback(null, addresses));
      return;
    }

    // Resolve IPv6 addresses
    resolver.resolve6(aaaa_alicdn_domain, (err, addresses) => {
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
