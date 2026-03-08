var ipRangeCheck = require("ip-range-check");

// List of IP ranges
const ipRanges2PTR = [
  "185.181.104.0/22", // INWX main range
  "109.107.32.0/19", // Brightbox1
  "185.2.204.0/22", // Brightbox2
];

module.exports = {
  check_for_ptr_ip: function (ipv4) {
    if (!ipv4) return false;
    return ipRanges2PTR.some(range => ipRangeCheck(ipv4, range));
  },
};
