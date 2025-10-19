module.exports = {
  check_for_azureweb_hostname: function (hostname) {
    if (!hostname) return false;

    var sdomains = hostname.split(".");
    sdomains.reverse();

    var dp1 = sdomains.indexOf("net");
    var dp2 = sdomains.indexOf("windows");
    var dp3 = sdomains.indexOf("azurewebsites");

    if (dp1 === 0 && dp2 === 1 && dp3 === 2) {
      sdomains[3] = "sip-v4andv6";
      var fixedhostname = sdomains.reverse().join(".");
      return fixedhostname;
    } else return false;
  },
};
