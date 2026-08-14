var assert = require('assert');
 
var awss3 = require('../providers/awss3');

assert.equal(awss3.check_for_s3_hostname("s3.amazonaws.com"), "s3.dualstack.us-east-1.amazonaws.com");
assert.notEqual(awss3.check_for_s3_hostname("s3.amazonaws.com.cn"), "s3.dualstack.us-east-1.amazonaws.com.cn");

assert.equal(awss3.check_for_s3_hostname("s3-1-w.amazonaws.com"), "s3-r-w.dualstack.us-east-1.amazonaws.com");
assert.equal(awss3.check_for_s3_hostname("s3-r-w.amazonaws.com"), "s3-r-w.dualstack.us-east-1.amazonaws.com");
assert.equal(awss3.check_for_s3_hostname("s3-w.amazonaws.com"), "s3-w.dualstack.us-east-1.amazonaws.com");

//assert.equal(awss3.check_for_s3_hostname("dualstack.s3.amazonaws.com"), "dualstack.s3.dualstack.us-east-1.amazonaws.com"); //own owns this bucket?

assert.equal(awss3.check_for_s3_hostname("redditstatic.s3.amazonaws.com"), "redditstatic.s3.dualstack.us-east-1.amazonaws.com");
assert.equal(awss3.check_for_s3_hostname("github-production-release-asset-2e65be.s3.amazonaws.com"), "github-production-release-asset-2e65be.s3.dualstack.us-east-1.amazonaws.com");
assert.equal(awss3.check_for_s3_hostname("2020awsreinvent.s3-us-west-2.amazonaws.com"), "2020awsreinvent.s3.dualstack.us-west-2.amazonaws.com");
assert.notEqual(awss3.check_for_s3_hostname("2020awsreinvent.s3-us-west-2.amazonaws.com.cn"), "2020awsreinvent.s3.dualstack.us-west-2.amazonaws.com.cn"); //china domain invalid region
assert.equal(awss3.check_for_s3_hostname("s3-accesspoint.us-east-2.amazonaws.com"), "s3-accesspoint.dualstack.us-east-2.amazonaws.com");

assert.equal(awss3.check_for_s3_hostname("s3-accelerate-speedtest.s3-accelerate.amazonaws.com"), "s3-accelerate-speedtest.s3-accelerate.dualstack.amazonaws.com");
assert.equal(awss3.check_for_s3_hostname("cheetah-test-us-east-1-02.s3-accelerate.amazonaws.com"), "cheetah-test-us-east-1-02.s3-accelerate.dualstack.amazonaws.com");
assert.notEqual(awss3.check_for_s3_hostname("s3-accelerate.amazonaws.com.cn"), "s3-accelerate.dualstack.amazonaws.com.cn"); //no dualstack domain

assert.equal(awss3.check_for_s3_hostname("s3.eu-central-1.amazonaws.com"), "s3.dualstack.eu-central-1.amazonaws.com");
assert.equal(awss3.check_for_s3_hostname("account-id.s3-control.eu-central-1.amazonaws.com"), "account-id.s3-control.dualstack.eu-central-1.amazonaws.com");
assert.equal(awss3.check_for_s3_hostname("s3-accesspoint.eu-central-1.amazonaws.com"), "s3-accesspoint.dualstack.eu-central-1.amazonaws.com");
assert.equal(awss3.check_for_s3_hostname("web.s3-accesspoint.eu-central-1.amazonaws.com"), "web.s3-accesspoint.dualstack.eu-central-1.amazonaws.com");

assert.equal(awss3.check_for_s3_hostname("s3.cn-north-1.amazonaws.com.cn"), "s3.dualstack.cn-north-1.amazonaws.com.cn");
assert.equal(awss3.check_for_s3_hostname("account-id.s3-control.cn-north-1.amazonaws.com.cn"), "account-id.s3-control.dualstack.cn-north-1.amazonaws.com.cn");
assert.equal(awss3.check_for_s3_hostname("web.s3-accesspoint.cn-north-1.amazonaws.com.cn"), "web.s3-accesspoint.dualstack.cn-north-1.amazonaws.com.cn");

assert.equal(awss3.check_for_s3_hostname("s3.ap-southeast-1.amazonaws.com"), "s3.dualstack.ap-southeast-1.amazonaws.com");
assert.equal(awss3.check_for_s3_hostname("account-id.s3-control.ap-southeast-1.amazonaws.com"), "account-id.s3-control.dualstack.ap-southeast-1.amazonaws.com");
assert.equal(awss3.check_for_s3_hostname("s3-accesspoint.ap-southeast-1.amazonaws.com"), "s3-accesspoint.dualstack.ap-southeast-1.amazonaws.com");
assert.equal(awss3.check_for_s3_hostname("web.s3-accesspoint.ap-southeast-1.amazonaws.com"), "web.s3-accesspoint.dualstack.ap-southeast-1.amazonaws.com");

assert.equal(awss3.check_for_s3_hostname("download.opencontent.netflix.com.s3.amazonaws.com"), "download.opencontent.netflix.com.s3.dualstack.us-east-1.amazonaws.com");

assert.equal(awss3.check_for_s3_hostname("s3.usw2-wl1-phx1.amazonaws.com"), "s3.dualstack.usw2-wl1-phx1.amazonaws.com");
assert.equal(awss3.check_for_s3_hostname("my-bucket.s3.usw2-wl1-phx1.amazonaws.com"), "my-bucket.s3.dualstack.usw2-wl1-phx1.amazonaws.com");
assert.equal(awss3.check_for_s3_hostname("s3.usw2-wl1-phx1-az1.amazonaws.com"), "s3.dualstack.usw2-wl1-phx1-az1.amazonaws.com");
assert.equal(awss3.check_for_s3_hostname("s3.uw2-wl1-nyc1.amazonaws.com"), "s3.dualstack.uw2-wl1-nyc1.amazonaws.com");
assert.equal(awss3.check_for_s3_hostname("s3.ape1-wl1-cph1-az1.amazonaws.com"), "s3.dualstack.ape1-wl1-cph1-az1.amazonaws.com");
assert.equal(awss3.check_for_s3_hostname("web.s3-accesspoint.usw2-wl1-phx1.amazonaws.com"), "web.s3-accesspoint.dualstack.usw2-wl1-phx1.amazonaws.com");

assert.equal(awss3.check_for_s3_hostname("s3.dualstack.us-east-1.amazonaws.com"), false);
assert.equal(awss3.check_for_s3_hostname("download.opencontent.netflix.com.s3.dualstack.us-east-1.amazonaws.com"), false);
assert.equal(awss3.check_for_s3_hostname("s3.dualstack.cn-north-1.amazonaws.com.cn"), false);

assert.equal(awss3.check_for_s3_hostname("s3-website-us-east-1.amazonaws.com"), "s3-website.dualstack.us-east-1.amazonaws.com");
assert.equal(awss3.check_for_s3_hostname("s3-website.ap-southeast-3.amazonaws.com"), "s3-website.dualstack.ap-southeast-3.amazonaws.com");
assert.notEqual(awss3.check_for_s3_hostname("s3-website.cn-northwest-1.amazonaws.com.cn"), "s3-website.dualstack.cn-northwest-1.amazonaws.com.cn"); //no dualstack domain

assert.equal(awss3.check_for_s3_hostname("pub-web-4b45fc8aac32a800.elb.eu-central-1.amazonaws.com"), false);
assert.equal(awss3.check_for_s3_hostname("cdn.assets.as2.amazonaws.com"), false);
assert.equal(awss3.check_for_s3_hostname("dynamodb.us-east-2.amazonaws.com"), false);
assert.equal(awss3.check_for_s3_hostname("lbr-optimized.s3.console-l.amazonaws.com"), false);

assert.equal(awss3.check_for_s3_hostname("amazonaws.com"), false); //https://gitlab.com/miyurusankalpa/IPv6-dns-server/-/issues/8

console.log("All Tests Passed")

