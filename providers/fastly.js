const ipRangeCheck = require("ip-range-check");
const net = require('net');

module.exports = {
  getfastlyv6address: function (
    customer,
    resolver,
    localStorageMemory,
    callback
  ) {
    const DOMAIN =
      customer === "github"
        ? "dualstack.github.io"
        : "dualstack.g.shared.global.fastly.net";

    const CACHE_KEY = customer + "fastlyv6range";

    // Check cache first
    const cachedData = localStorageMemory.getItem(CACHE_KEY);
    if (cachedData) {
      try {
        const addresses = Array.isArray(cachedData)
          ? cachedData
          : JSON.parse(cachedData);
        callback(null, addresses);
        return;
      } catch (error) {
        // Continue to resolve if cache is corrupted
      }
    }

    // Resolve IPv6 addresses from domain
    resolver.resolve6(DOMAIN, (err, addresses) => {
      if (err) {
        callback(err, null);
        return;
      }

      // Process addresses: slice to remove last 3 chars from each IP
      const slicedAddresses = addresses.map((ip) => ip.slice(0, -3));

      // Cache the sliced addresses
      try {
        localStorageMemory.setItem(CACHE_KEY, JSON.stringify(slicedAddresses));
      } catch (error) {
        // Silently handle cache error, still return results
      }

      // Return the sliced addresses via callback
      callback(null, slicedAddresses);
    });
  },
  fastlyv4tov6: function (ipv4, resolver, localStorageMemory) {
    return new Promise((resolve, reject) => {
      //console.log('f', ipv4);
      if (!ipv4 || !ipv4[0]) {
        resolve(false);
        return;
      }

      var cust;
      if (module.exports.check_for_fastly_ip(ipv4[0])) cust = "fastly";
      if (module.exports.check_for_githubpages_ip(ipv4[0])) cust = "github";

      if (!cust) {
        resolve(false);
        return;
      }

      module.exports.getfastlyv6address(
        cust,
        resolver,
        localStorageMemory,
        (err, addresses) => {
          if (err || !addresses || !Array.isArray(addresses)) {
            resolve(false);
            return;
          }

          // Use the getV6HexFromIPv4 utility function
          var v6hex = module.exports.getV6HexFromIPv4(ipv4, cust);

          var iplist = [];
          addresses.forEach((ipv6, index) => {
            var gen_ipv6address =  ipv6 + v6hex;
            if(net.isIPv6(gen_ipv6address)) iplist[index] = ipv6 + v6hex;
          });

          //console.log(iplist);
          resolve(iplist);
        }
      );
    });
  },
  // Extracts the v6hex value from IPv4 octets based on customer type
  getV6HexFromIPv4: function (ipv4, cust) {
    var octets = ipv4[0].split(".");
    //console.log('octets', octets);

    let v6hex;
    if (cust === "github") {
      v6hex = octets[3];
    } else if (octets[0] === 151) {
      v6hex = (octets[2] % 64) * 256 + Number(octets[3]);
    } else {
      v6hex = (octets[2] % 4) * 256 + Number(octets[3]);
    }

    return v6hex;
  },
  check_for_fastly_a: function (authority) {
    //console.log('a', authority);
    if (!authority) return false;
    if (authority == "hostmaster.fastly.com") {
      //console.log("fastly matched");
      return true;
    } else return false;
  },
  check_for_fastly_hostname: function (hostname) {
    if (!hostname) return false;
    var sdomains = hostname.split(".");
    sdomains.reverse();
    var dp1 = sdomains.indexOf("net");
    var dp2 = sdomains.indexOf("fastly");
    var dp3 = sdomains.indexOf("fastlylb");

    //console.log(sdomains);

    if (dp1 === 0 && (dp2 == 1 || dp3 == 1)) {
      //console.log("fastly matched");
      sdomains[sdomains.length] = "dualstack";
      var fixedhostname = sdomains.reverse().join(".");
      return fixedhostname;
    } else return false;
  },
  check_for_fastly_ip: function (ipv4) {
    //console.log('fastly ip check', ipv4);
    if (!ipv4) return false;

    return ipRangeCheck(ipv4, [
      "151.101.0.0/16",
      "199.232.0.0/16",
      "146.75.0.0/17",
      "167.82.0.0/17", // anycast, verified: 167.82.61.140, 167.82.57.140 (443→421/500)
      "140.248.128.0/17", // anycast, verified: 140.248.129.x, 140.248.133.x, 140.248.142.x (443→421)
    ]);
  },
  check_for_githubpages_ip: function (ipv4) {
    //console.log('githubio ip check', ipv4);
    if (!ipv4) return false;

    if (!ipRangeCheck(ipv4, "185.199.108.0/22")) return false;
    else return true;

    /*var octets = ipv4.split(".");
        if (octets[3] == 153) return true;
        else return false;*/
  },
};
