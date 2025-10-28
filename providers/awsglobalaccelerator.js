module.exports = {
  check_for_awsglb_hostname: function (hostname) {
    if (!hostname) return false;

    var sdomains = hostname.split(".");
    sdomains.reverse();

    var dp1 = sdomains.indexOf("com");
    var dp2 = sdomains.indexOf("awsglobalaccelerator");

    if (dp1 === 0 && dp2 === 1) {
      if (sdomains[2] !== "dualstack") sdomains.splice(2, 0, "dualstack");
      var fixedhostname = sdomains.reverse().join(".");
      return fixedhostname;
    } else return false;
  },
};
