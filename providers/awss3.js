module.exports = {
  check_for_s3_hostname: function (hostname) {
    if (!hostname) return false;
    var sdomains = hostname.split(".");
    sdomains.reverse();
    //console.log(sdomains);

    var dp1 = sdomains.indexOf("cn");

    //matched china region, remove it thinking it does not exist
    if (dp1 == 0) sdomains.splice(0, 1);

    var dp2 = sdomains.indexOf("amazonaws");
    var dpff = sdomains.indexOf("dualstack");

    //match dualstacked domains
    if (dpff === 3 && dp2 === 1) return false;

    var dp3 = sdomains.indexOf("s3");
    var dp4 = sdomains.indexOf("s3-control");
    //var dp5 = sdomains.indexOf("s3-w");
    var dp6 = sdomains.indexOf("s3-accelerate");
    var dp7 = sdomains.indexOf("s3-accesspoint");
    var dp8 = sdomains.indexOf("s3-website");
    var dp9 = sdomains.indexOf("console-l");

    if (dp2 == 1 && sdomains.length > 2) {
      //console.log(hostname+" amazon matched");
      var ssdomains = sdomains[2].split("-");
      if (sdomains.length == 5) sdomains[5] = sdomains[4];
      //console.log(ssdomains);

      if (dp6 === 2) {
        //matched s3-accelerate domains
        //sdomains.splice(2, 0, "s3-accelerate");
        sdomains.splice(2, 0, "dualstack");
        dp1 = -1; //break china domain match
        //console.log(sdomains);
        //console.log("s3 matched 1");
      } else if (dp7 === 3) {
        //matched s3-accesspoint domains
        sdomains.splice(4, 1);
        //console.log("s3 matched 7");
      } else if (dp8 === 3) {
        //matched s3-website domains
        sdomains.splice(4, 1);
        dp1 = -1; //break china domain match
        //console.log("s3 matched 8");
      } else if (dp9 === 2) {
        //matched console domains
        //console.log("s3 matched 9");
        return false;
      } else if (
        ssdomains[0] === "s3" &&
        (ssdomains.length === 3 || ssdomains.length === 2) &&
        dp1 !== 0
      ) {
        //matched  s3-1-w.amazonaws.com or s3-w.amazonaws.com
        sdomains.splice(2, 0, "us-east-1");
        if (ssdomains[1] == "1") sdomains[3] = "s3-r-w"; //s3-1-w.dualstack.us-east-1.amazonaws.com does not AAAA, hmm
        //sdomains.splice(4, 0, "s3");
        //console.log("s3 matched 2");
      } else if (dp3 === 3 || dp4 === 3) {
        sdomains.splice(4, 1);
        //console.log("s3 matched 3");
      } else if (ssdomains[0] === "s3" && ssdomains[1] === "website") {
        //matched s3-website-us-east-1.amazonaws.com
        sdomains.splice(2, 1, "us-east-1");
        sdomains.splice(3, 1, "s3-website");
        //console.log("s3 matched 5");
      } else if (ssdomains.length > 1) {
        //matched  **.s3-[region].amazonaws.com
        if (ssdomains[0] !== "s3") return false;

        sdomains.splice(2, 1); //remove matched s3 region

        if (ssdomains.length == 0 && dp1 !== 0) {
          sdomains.splice(2, 0, "us-east-1");
        } else {
          if (ssdomains.length == 4 && dp1 !== 0) ssdomains.splice(0, 1); //remove s3 from region {
          sdomains.splice(2, 0, ssdomains.join("-")); //recreate the region without s3
        }

        //console.log(sdomains);
        if (dp3 == -1) sdomains.splice(3, 0, "s3");

        //console.log("s3 matched 5");
      } else if (dp2 === 1 && dp3 === 2 && dp1 !== 0) {
        sdomains.splice(2, 0, "us-east-1");
        //console.log("s3 matched 6");
      } else return false;

      if (sdomains[2] !== "dualstack") sdomains.splice(3, 0, "dualstack");

      //matched china region, add the china tld back
      if (dp1 == 0) sdomains.splice(0, 0, "cn");

      //console.log(sdomains);
      var fixedhostname = sdomains.reverse().join(".");

      return fixedhostname;
    } else return false;
  },
};
