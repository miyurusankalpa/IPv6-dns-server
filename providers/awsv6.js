module.exports = {
  check_for_awsv6_hostname: function (hostname) {
    if (!hostname) return false;
    var sdomains = hostname.split(".");
    sdomains.reverse();

    // Match: <service>.<region>.amazonaws.com
    // e.g., ec2.ap-southeast-1.amazonaws.com, lambda.us-east-1.amazonaws.com
    var dp1 = sdomains.indexOf("com");
    var dp2 = sdomains.indexOf("amazonaws");

    if (dp1 === 0 && dp2 === 1 && sdomains[2] && sdomains[3]) {
      // Rewrite: <service>.<region>.amazonaws.com → <service>.<region>.api.aws
      // sdomains is reversed: ["com", "amazonaws", "<region>", "<service>"]
      // We want: ["<service>", "<region>", "api", "aws"]
      var service = sdomains[3];
      var region = sdomains[2];
      return service + "." + region + ".api.aws";
    } else return false;
  },
};
