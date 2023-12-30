var assert = require('assert');
 
var alibabaoss = require('../providers/alibabaoss');
  
assert.equal(alibabaoss.check_for_oss_hostname("oss.aliyuncs.com"), "cn-hangzhou.oss.aliyuncs.com");
assert.equal(alibabaoss.check_for_oss_hostname("examplebucket.oss.aliyuncs.com"), "cn-hangzhou.oss.aliyuncs.com");
assert.equal(alibabaoss.check_for_oss_hostname("example-bucket.oss.aliyuncs.com"), "cn-hangzhou.oss.aliyuncs.com");

assert.equal(alibabaoss.check_for_oss_hostname("oss-cn-hangzhou.aliyuncs.com"), "cn-hangzhou.oss.aliyuncs.com");
assert.equal(alibabaoss.check_for_oss_hostname("oss-cn-beijing.aliyuncs.com"), "cn-beijing.oss.aliyuncs.com");
assert.equal(alibabaoss.check_for_oss_hostname("oss-ap-southeast-1.aliyuncs.com"), "ap-southeast-1.oss.aliyuncs.com");
assert.equal(alibabaoss.check_for_oss_hostname("oss-eu-central-1.aliyuncs.com"), "eu-central-1.oss.aliyuncs.com");

assert.equal(alibabaoss.check_for_oss_hostname("examplebucket.oss-cn-hangzhou.aliyuncs.com"), "cn-hangzhou.oss.aliyuncs.com");
assert.equal(alibabaoss.check_for_oss_hostname("examplebucket.oss-cn-beijing.aliyuncs.com"), "cn-beijing.oss.aliyuncs.com");
assert.equal(alibabaoss.check_for_oss_hostname("examplebucket.oss-ap-southeast-1.aliyuncs.com"), "ap-southeast-1.oss.aliyuncs.com");
assert.equal(alibabaoss.check_for_oss_hostname("examplebucket.oss-eu-central-1.aliyuncs.com"), "eu-central-1.oss.aliyuncs.com");

assert.equal(alibabaoss.check_for_oss_hostname("examplebucket.cn-hangzhou.oss.aliyun-inc.com"), "examplebucket.cn-hangzhou.oss.aliyuncs.com");
assert.equal(alibabaoss.check_for_oss_hostname("examplebucket.cn-beijing.oss.aliyun-inc.com"), "examplebucket.cn-beijing.oss.aliyuncs.com");
assert.equal(alibabaoss.check_for_oss_hostname("examplebucket.ap-southeast-1.oss.aliyun-inc.com"), "examplebucket.ap-southeast-1.oss.aliyuncs.com");
assert.equal(alibabaoss.check_for_oss_hostname("examplebucket.eu-central-1.oss.aliyun-inc.com"), "examplebucket.eu-central-1.oss.aliyuncs.com");

assert.equal(alibabaoss.check_for_oss_hostname("cn-hangzhou.oss.aliyuncs.com"), "cn-hangzhou.oss.aliyuncs.com");
assert.equal(alibabaoss.check_for_oss_hostname("cn-beijing.oss.aliyuncs.com"), "cn-beijing.oss.aliyuncs.com");
assert.equal(alibabaoss.check_for_oss_hostname("examplebucket.cn-hangzhou.oss.aliyuncs.com"), "examplebucket.cn-hangzhou.oss.aliyuncs.com");
assert.equal(alibabaoss.check_for_oss_hostname("examplebucket.eu-central-1.oss.aliyuncs.com"), "examplebucket.eu-central-1.oss.aliyuncs.com");

assert.equal(alibabaoss.check_for_oss_hostname("alicloud-common.oss-ap-southeast-1.aliyuncs.com"), "ap-southeast-1.oss.aliyuncs.com");

console.log("All Tests Passed")

