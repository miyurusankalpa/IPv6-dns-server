module.exports = {
  getgcorecdnv6address: function (resolver, localStorageMemory, callback) {
    // ipv6 enabled domain
    const aaaa_gcore_domain = "d.gcdn.co"; //https://codeberg.org/IPv6-Monostack/delegacy-rpz/src/commit/48fdd433336cd6009e751677b131bbd1718d5573/dnsconfig.js#L2244
    const CACHE_KEY = "gcorecdnv6addy";

    // Check cache first
    const cachedV6List = localStorageMemory.getItem(CACHE_KEY);
    if (cachedV6List) {
      const addresses = Array.isArray(cachedV6List) ? cachedV6List : JSON.parse(cachedV6List);
      // Call callback asynchronously to maintain consistent behavior
      setImmediate(() => callback(null, addresses));
      return;
    }

    // Resolve IPv6 addresses
    resolver.resolve6(aaaa_gcore_domain, (err, addresses) => {
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
