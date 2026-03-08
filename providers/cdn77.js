module.exports = {
  check_for_cdn77_a: function (authority) {
    //console.log('a', authority);
    if (!authority) return false;
    if (authority == "admin.cdn77.com") {
      //console.log("cdn77 matched");
      return true;
    } else return false;
  },
  check_for_cdn77_hostname: function (hostname) {
    if (!hostname) return false;
    var sdomains = hostname.split(".");
    sdomains.reverse();
    var dp1 = sdomains.indexOf("org");
    var dp2 = sdomains.indexOf("cdn77");

    if (dp1 === 0 && dp2 == 1) {
      //console.log("cdn77 matched");
      return true;
    } else return false;
  },
  get_cdn77_v6address: function (resolver, localStorageMemory, callback) {
    var aaaa_cdn77_domain = "www.cdn77.com"; //static content
    //var aaaa_cdn77_domain = 'hls-b.udemycdn.com'; //for video content

    const CACHE_KEY = "cdn77v6addy";

    // Check cache first
    const cachedV6List = localStorageMemory.getItem(CACHE_KEY);
    if (cachedV6List) {
      const addresses = Array.isArray(cachedV6List) ? cachedV6List : JSON.parse(cachedV6List);
      // Call callback asynchronously to maintain consistent behavior
      setImmediate(() => callback(null, addresses));
      return;
    }

    // Resolve IPv6 addresses
    resolver.resolve6(aaaa_cdn77_domain, (err, addresses) => {
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
