var assert = require('assert');
 
function check_for_oss_hostname(hostname) {
    if (!hostname) return false;
    var sdomains = hostname.split(".");
    sdomains.reverse();
    //console.log(sdomains);

    var dp0 = sdomains.indexOf("com");
    var dp1 = sdomains.indexOf("aliyuncs");

    if (dp0 == 0 && dp1 == 1) {
        //console.log(hostname+" aliyuncs matched");	

        var dpff1 = sdomains.indexOf("oss");
        //console.log("dpff1: "+dpff1);

        var ssdomains = sdomains[2].split("-");

        var dpff2 = ssdomains.indexOf("oss");
        //console.log("dpff2: "+dpff2);

        if(dpff1 == 2 && dpff2 == 0 && !sdomains[3]) { //match oss.aliyuncs.com
            //console.log("oss 3 matched");
            ssdomains[0] = "oss";
            ssdomains[1] = "cn";
            ssdomains[2] = "hangzhou";
        }

        if(dpff2==0)
        {
            //console.log(ssdomains);

            ssdomains.splice(0, 1); //delete oss from region domain

           // console.log(ssdomains);

            /*if(dpff1 == 2 && ssdomains.length == 1) { //match oss.aliyuncs.com
                ssdomains[0] = "cn";
                ssdomains[1] = "hangzhou";
            }

            console.log(ssdomains);*/

            //reattach the corrected region
            if(ssdomains.length!==0) sdomains[2] = ssdomains.join("-"); else sdomains.splice(2, 1);

            //console.log(sdomains);

            sdomains.splice(2, 0, "oss");

           //console.log(sdomains);
        } else return false;

        var fixedhostname = sdomains.reverse().join(".");

        return fixedhostname;

    } else return false;
}

assert.equal(check_for_oss_hostname("oss.aliyuncs.com"), "cn-hangzhou.oss.aliyuncs.com");

/* matching these breaks other - will need to match region codes to get these to work.
assert.equal(check_for_oss_hostname("examplebucket.oss.aliyuncs.com"), "examplebucket.cn-hangzhou.oss.aliyuncs.com");
assert.equal(check_for_oss_hostname("example-bucket.oss.aliyuncs.com"), "example-bucket.cn-hangzhou.oss.aliyuncs.com");
*/

assert.equal(check_for_oss_hostname("oss-cn-hangzhou.aliyuncs.com"), "cn-hangzhou.oss.aliyuncs.com");
assert.equal(check_for_oss_hostname("oss-cn-beijing.aliyuncs.com"), "cn-beijing.oss.aliyuncs.com");
assert.equal(check_for_oss_hostname("oss-ap-southeast-1.aliyuncs.com"), "ap-southeast-1.oss.aliyuncs.com");
assert.equal(check_for_oss_hostname("oss-eu-central-1.aliyuncs.com"), "eu-central-1.oss.aliyuncs.com");

assert.equal(check_for_oss_hostname("examplebucket.oss-cn-hangzhou.aliyuncs.com"), "examplebucket.cn-hangzhou.oss.aliyuncs.com");
assert.equal(check_for_oss_hostname("examplebucket.oss-cn-beijing.aliyuncs.com"), "examplebucket.cn-beijing.oss.aliyuncs.com");
assert.equal(check_for_oss_hostname("examplebucket.oss-ap-southeast-1.aliyuncs.com"), "examplebucket.ap-southeast-1.oss.aliyuncs.com");
assert.equal(check_for_oss_hostname("examplebucket.oss-eu-central-1.aliyuncs.com"), "examplebucket.eu-central-1.oss.aliyuncs.com");

assert.equal(check_for_oss_hostname("cn-hangzhou.oss.aliyuncs.com"), "cn-hangzhou.oss.aliyuncs.com");
assert.equal(check_for_oss_hostname("cn-beijing.oss.aliyuncs.com"), "cn-beijing.oss.aliyuncs.com");
assert.equal(check_for_oss_hostname("examplebucket.cn-hangzhou.oss.aliyuncs.com"), "examplebucket.cn-hangzhou.oss.aliyuncs.com");
assert.equal(check_for_oss_hostname("examplebucket.eu-central-1.oss.aliyuncs.com"), "examplebucket.eu-central-1.oss.aliyuncs.com");

assert.equal(check_for_oss_hostname("alicloud-common.oss-ap-southeast-1.aliyuncs.com"), "alicloud-common.ap-southeast-1.oss.aliyuncs.com");

console.log("All Tests Passed")

