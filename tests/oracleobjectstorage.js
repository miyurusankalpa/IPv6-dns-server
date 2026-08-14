var assert = require("assert");

var oracleobjectstorage = require("../providers/oracleobjectstorage");

// native test
assert.equal(oracleobjectstorage.check_for_oracleobjectstorage_hostname("objectstorage.us-ashburn-1.oci.customer-oci.com"), "objectstorage.us-ashburn-1.ds.oci.customer-oci.com");
assert.equal(oracleobjectstorage.check_for_oracleobjectstorage_hostname("adwc4pm.objectstorage.us-ashburn-1.oci.customer-oci.com"), "adwc4pm.objectstorage.us-ashburn-1.ds.oci.customer-oci.com");
assert.equal(oracleobjectstorage.check_for_oracleobjectstorage_hostname("objectstorage.us-phoenix-1.oraclecloud.com"), "objectstorage.us-phoenix-1.ds.oci.customer-oci.com");
assert.equal(oracleobjectstorage.check_for_oracleobjectstorage_hostname("objectstorage.us-phoenix-1.ds.oraclecloud.com"), "objectstorage.us-phoenix-1.ds.oraclecloud.com");

// official V2 dual-stack endpoints
assert.equal(oracleobjectstorage.check_for_oracleobjectstorage_hostname("bkxamns.objectstorage.us-ashburn-1.oraclecloud.com"), "bkxamns.objectstorage.us-ashburn-1.ds.oci.customer-oci.com");
assert.equal(oracleobjectstorage.check_for_oracleobjectstorage_hostname("bkxamns.objectstorage.us-ashburn-1.ds.oci.customer-oci.com"), "bkxamns.objectstorage.us-ashburn-1.ds.oci.customer-oci.com");

// s3 compatible test
assert.equal(oracleobjectstorage.check_for_oracleobjectstorage_hostname("compat.objectstorage.ap-mumbai-1.oraclecloud.com"), "objectstorage.ap-mumbai-1.ds.oci.customer-oci.com");
assert.equal(oracleobjectstorage.check_for_oracleobjectstorage_hostname("compat.objectstorage.ap-singapore-1.oraclecloud.com"), "objectstorage.ap-singapore-1.ds.oci.customer-oci.com");
assert.equal(oracleobjectstorage.check_for_oracleobjectstorage_hostname("bmkltsly13vb.compat.objectstorage.ap-mumbai-1.oraclecloud.com"), "bmkltsly13vb.compat.objectstorage.ap-mumbai-1.ds.oci.customer-oci.com");
assert.equal(oracleobjectstorage.check_for_oracleobjectstorage_hostname("namespace.compat.objectstorage.us-phoenix-1.oci.customer-oci.com"), "namespace.compat.objectstorage.us-phoenix-1.ds.oci.customer-oci.com");

// swift test
assert.equal(oracleobjectstorage.check_for_oracleobjectstorage_hostname("swiftobjectstorage.us-ashburn-1.oci.customer-oci.com"), "swiftobjectstorage.us-ashburn-1.ds.oci.customer-oci.com");
assert.equal(oracleobjectstorage.check_for_oracleobjectstorage_hostname("swiftobjectstorage.us-ashburn-1.ds.oci.customer-oci.com"), "swiftobjectstorage.us-ashburn-1.ds.oci.customer-oci.com");
assert.equal(oracleobjectstorage.check_for_oracleobjectstorage_hostname("namespace.swiftobjectstorage.us-ashburn-1.oci.customer-oci.com"), "namespace.swiftobjectstorage.us-ashburn-1.ds.oci.customer-oci.com");
assert.equal(oracleobjectstorage.check_for_oracleobjectstorage_hostname("namespace.swiftobjectstorage.us-ashburn-1.ds.oci.customer-oci.com"), "namespace.swiftobjectstorage.us-ashburn-1.ds.oci.customer-oci.com");

// official swift dual-stack endpoint
assert.equal(oracleobjectstorage.check_for_oracleobjectstorage_hostname("bkxamns.swiftobjectstorage.us-ashburn-1.oraclecloud.com"), "bkxamns.swiftobjectstorage.us-ashburn-1.ds.oci.customer-oci.com");
assert.equal(oracleobjectstorage.check_for_oracleobjectstorage_hostname("bkxamns.swiftobjectstorage.us-ashburn-1.ds.oci.customer-oci.com"), "bkxamns.swiftobjectstorage.us-ashburn-1.ds.oci.customer-oci.com");

// official S3-compatible dual-stack endpoint
assert.equal(oracleobjectstorage.check_for_oracleobjectstorage_hostname("bkxamns.compat.objectstorage.us-ashburn-1.oraclecloud.com"), "bkxamns.compat.objectstorage.us-ashburn-1.ds.oci.customer-oci.com");
assert.equal(oracleobjectstorage.check_for_oracleobjectstorage_hostname("bkxamns.compat.objectstorage.us-ashburn-1.ds.oci.customer-oci.com"), "bkxamns.compat.objectstorage.us-ashburn-1.ds.oci.customer-oci.com");

// negative test
assert.equal(oracleobjectstorage.check_for_oracleobjectstorage_hostname("www.oracle.com"), false);
assert.equal(oracleobjectstorage.check_for_oracleobjectstorage_hostname("oraclecloud.com"), false);
assert.equal(oracleobjectstorage.check_for_oracleobjectstorage_hostname("example.com"), false);
assert.equal(oracleobjectstorage.check_for_oracleobjectstorage_hostname("objectstorage.oci.customer-oci.com"), false);

console.log("All Tests Passed");
