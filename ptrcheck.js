var ipRangeCheck = require("ip-range-check");

// List of IP ranges
const ipRanges2PTR = [
  "185.181.104.0/22", // INWX main range
];

module.exports = {
  check_for_ptr_ip: function (ipv4) {
    if (!ipv4) return false;
    return ipRanges2PTR.some(range => ipRangeCheck(ipv4, range));
  },
};
