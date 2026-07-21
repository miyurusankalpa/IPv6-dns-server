var assert = require('assert');
var awsv6 = require('../providers/awsv6');

// EC2
assert.equal(awsv6.check_for_awsv6_hostname("ec2.ap-southeast-1.amazonaws.com"), "ec2.ap-southeast-1.api.aws");
assert.equal(awsv6.check_for_awsv6_hostname("ec2.us-east-1.amazonaws.com"), "ec2.us-east-1.api.aws");
assert.equal(awsv6.check_for_awsv6_hostname("ec2.eu-west-1.amazonaws.com"), "ec2.eu-west-1.api.aws");

// Lambda
assert.equal(awsv6.check_for_awsv6_hostname("lambda.ap-southeast-1.amazonaws.com"), "lambda.ap-southeast-1.api.aws");
assert.equal(awsv6.check_for_awsv6_hostname("lambda.us-west-2.amazonaws.com"), "lambda.us-west-2.api.aws");

// Other AWS services
assert.equal(awsv6.check_for_awsv6_hostname("sqs.eu-central-1.amazonaws.com"), "sqs.eu-central-1.api.aws");
assert.equal(awsv6.check_for_awsv6_hostname("sns.ap-northeast-1.amazonaws.com"), "sns.ap-northeast-1.api.aws");
assert.equal(awsv6.check_for_awsv6_hostname("dynamodb.us-east-1.amazonaws.com"), "dynamodb.us-east-1.api.aws");
assert.equal(awsv6.check_for_awsv6_hostname("s3.ap-south-1.amazonaws.com"), "s3.ap-south-1.api.aws");
assert.equal(awsv6.check_for_awsv6_hostname("bedrock-runtime.us-east-1.amazonaws.com"), "bedrock-runtime.us-east-1.api.aws");

// Non-matching — ELB hostnames (5+ parts, should fall through to DNS64)
assert.equal(awsv6.check_for_awsv6_hostname("redirect-alb-916028820.eu-central-1.elb.amazonaws.com"), false);
assert.equal(awsv6.check_for_awsv6_hostname("my-alb-1234567890.us-east-1.elb.amazonaws.com"), false);
assert.equal(awsv6.check_for_awsv6_hostname("internal-my-nlb-abc123.eu-west-1.elb.amazonaws.com"), false);

// Non-matching — other patterns
assert.equal(awsv6.check_for_awsv6_hostname("s3.amazonaws.com"), false);
assert.equal(awsv6.check_for_awsv6_hostname("www.amazonaws.com"), false);
assert.equal(awsv6.check_for_awsv6_hostname("example.com"), false);
assert.equal(awsv6.check_for_awsv6_hostname("ec2.api.aws"), false);
assert.equal(awsv6.check_for_awsv6_hostname(null), false);
assert.equal(awsv6.check_for_awsv6_hostname(undefined), false);

console.log("All Tests Passed");
