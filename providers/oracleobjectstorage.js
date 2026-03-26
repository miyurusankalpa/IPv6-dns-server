module.exports = {
  check_for_oracleobjectstorage_hostname: function (hostname) {
    if (!hostname) return false;

    var labels = hostname.split(".");
    var suffix;
    var suffixType;

    if (
      labels.length >= 2 &&
      labels[labels.length - 2] === "oraclecloud" &&
      labels[labels.length - 1] === "com"
    ) {
      suffix = ["oraclecloud", "com"];
      suffixType = "oraclecloud";
    } else if (
      labels.length >= 3 &&
      labels[labels.length - 3] === "oci" &&
      labels[labels.length - 2] === "customer-oci" &&
      labels[labels.length - 1] === "com"
    ) {
      suffix = ["oci", "customer-oci", "com"];
      suffixType = "customer-oci";
    } else {
      return false;
    }

    var body = labels.slice(0, labels.length - suffix.length);
    if (body.length < 2) return false;

    var dsEnabled = body[body.length - 1] === "ds";
    if (dsEnabled) body = body.slice(0, -1);

    var service;
    var namespace;
    var region;
    var isCompat = false;

    if (
      body.length === 2 &&
      (body[0] === "objectstorage" || body[0] === "swiftobjectstorage")
    ) {
      service = body[0];
      region = body[1];
    } else if (
      body.length === 3 &&
      body[0] === "compat" &&
      body[1] === "objectstorage"
    ) {
      if (dsEnabled) return "objectstorage." + body[2] + ".ds.oci.customer-oci.com";
      return "objectstorage." + body[2] + ".ds.oci.customer-oci.com";
    } else if (
      body.length === 3 &&
      (body[1] === "objectstorage" || body[1] === "swiftobjectstorage")
    ) {
      namespace = body[0];
      service = body[1];
      region = body[2];
    } else if (
      body.length === 4 &&
      body[1] === "compat" &&
      body[2] === "objectstorage"
    ) {
      namespace = body[0];
      isCompat = true;
      service = body[2];
      region = body[3];
    } else {
      return false;
    }

    var outputSuffix = suffix;
    if (suffixType === "oraclecloud" && !dsEnabled) {
      outputSuffix = ["oci", "customer-oci", "com"];
    }

    var transformed = [];
    if (namespace) transformed.push(namespace);
    if (isCompat) transformed.push("compat");
    transformed.push(service);
    transformed.push(region);
    transformed.push("ds");
    transformed = transformed.concat(outputSuffix);

    return transformed.join(".");
  },
};
