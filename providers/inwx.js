var ipRangeCheck = require("ip-range-check");

module.exports = {
  check_for_inwx_ip: function (ipv4) {
    //console.log('linw ip check', ipv4);
    if (!ipv4) return false;

    return ipRangeCheck(ipv4, ["185.181.104.0/22"]);
  },
};
