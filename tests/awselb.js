var assert = require('assert');
 
function check_for_elbclassic_hostname(hostname) {
    if (!hostname) return false;
    var sdomains = hostname.split(".");
    sdomains.reverse();
    //console.log(sdomains);

    var dp1 = sdomains.indexOf("cn");

    //matched china region, remove it thinking it does not exist
    if (dp1 == 0) sdomains.splice(0, 1);

    var dp2 = sdomains.indexOf("amazonaws");
    var dp3 = sdomains.indexOf("elb");

    if (dp2 == 1 && dp3 == 2) {
        //console.log(hostname+" amazon elb matched");		
  
        if(sdomains[sdomains.length]!=="dualstack") sdomains.splice(sdomains.length, 0, "dualstack"); //if the end is not dualstack add it.

        //matched china region, add the china tld back
        if (dp1 == 0) sdomains.splice(0, 0, "cn");

        //console.log(sdomains);
        var fixedhostname = sdomains.reverse().join(".");

        return fixedhostname;

    } else return false;
}

assert.equal(check_for_elbclassic_hostname("test.us-east-1.elb.amazonaws.com"), "dualstack.test.us-east-1.elb.amazonaws.com"); //non existing, but follows the format
assert.equal(check_for_elbclassic_hostname("test.cn-northwest-1.elb.amazonaws.com.cn"), "dualstack.test.cn-northwest-1.elb.amazonaws.com.cn"); //non existing, but follows the format

assert.equal(check_for_elbclassic_hostname("fe-pew1-ext-s3store-elb-1085125128.eu-west-1.elb.amazonaws.com"), "dualstack.fe-pew1-ext-s3store-elb-1085125128.eu-west-1.elb.amazonaws.com");

console.log("All Tests Passed")