var ipRangeCheck = require("ip-range-check");

module.exports = {
  check_for_cachefly_hostname: function (hostname) {
    if (!hostname) return false;

    var labels = hostname.split(".");
    if (labels.length < 4) return false;

    if (labels[labels.length - 2] !== "cachefly" || labels[labels.length - 1] !== "net") {
      return false;
    }

    var first = labels[0];
    if (!/^r?vip\d+$/.test(first)) return false;

    if (first.startsWith("vip")) first = "r" + first;

    var middle = labels.slice(1, -2).join(".");
    if (!middle) return false;

    // Keep legacy mapping behavior for g-anycast1.
    if (middle === "g-anycast1") middle = "g";

    return first + "-dstack." + middle + ".cachefly.net";
  },
  check_for_cachefly_ip: function (ipv4) {
    if (!ipv4) return false;

    return ipRangeCheck(ipv4, ["205.234.175.0/24"]);
  },
  cacheflyv4to6: function (ipv4) {
    if (!ipv4) return false;

    var octets = ipv4.split(".");
    if (octets.length < 4) return false;

    return "2605:4c40::" + octets[2] + ":" + octets[3];
  },
};
