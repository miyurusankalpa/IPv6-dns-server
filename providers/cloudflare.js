var ipRangeCheck = require("ip-range-check");

module.exports = {
  check_for_cloudflare_a: function (authority) {
    //console.log('a', authority);
    if (!authority) return false;
    if (authority == "dns.cloudflare.com") {
      //console.log("cloudflare matched");
      return true;
    } else return false;
  },
  check_for_cloudflare_hostname: function (hostname) {
    if (!hostname) return false;
    var sdomains = hostname.split(".");
    sdomains.reverse();
    var dp1 = sdomains.indexOf("net");
    var dp2 = sdomains.indexOf("cloudflare");
    var dp3 = sdomains.indexOf("cdn");

    if (dp1 === 0 && dp2 == 1 && dp3 == 2) {
      //console.log("cloudflare matched");
      return true;
    } else return false;
  },
  check_for_cloudflare_ip: function (ipv4) {
    //console.log('cloudflare ip check', ipv4);
    if (!ipv4) return false;

    return ipRangeCheck(ipv4, ["104.16.0.0/12", "162.159.128.0/17"]);
  },
  getcloudflarev6address: function () {
    return "2606:4700::6810:bad"; //will give SSL_ERROR_NO_CYPHER_OVERLAP on non cloudflare sites on aggressive mode
  },
  check_for_shopify_hostname: function (hostname) {
    if (!hostname) return false;
    var sdomains = hostname.split(".");
    sdomains.reverse();
    var dp1 = sdomains.indexOf("com");
    var dp2 = sdomains.indexOf("shopify");
    var dp3 = sdomains.indexOf("myshopify");

    if (dp1 === 0 && (dp2 == 1 || dp3 == 1)) {
      //console.log("shopify matched");
      return hostname;
    } else return false;
  },
  check_for_shopify_ip: function (ipv4) {
    //console.log('shopify ip check', ipv4);
    if (!ipv4) return false;

    return ipRangeCheck(ipv4, [
      "23.227.37.0/24",
      "23.227.38.0/23",
      "23.227.60.0/24",
      "185.146.172.0/23",
    ]);
  },
  getshopifyv6address: function () {
    return "2620:127:f00f::";
  },
};
