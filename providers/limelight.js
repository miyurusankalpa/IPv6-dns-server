module.exports = {
  check_for_lln_hostname: function (hostname) {
    if (!hostname) return false;
    var sdomains = hostname.split(".");
    sdomains.reverse();
    var dp1 = sdomains.indexOf("net");
    var dp2 = sdomains.indexOf("llnwi");

    if (dp1 === 0 && dp2 == 1) {
      //console.log("llnwi matched");
      sdomains[3] = "msftstore";
      var fixedhostname = sdomains.reverse().join(".");
      return fixedhostname;
    } else return false;
  },
};
