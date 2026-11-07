// Azure Storage accounts CNAME to <service>.<cluster>.store.core.windows.net,
// which is IPv4-only. The dual-stack sibling <service>-ds.<cluster>.
// store.core.windows.net answers AAAA for the same cluster.
// Thanks to @Mynacol for finding this:
// https://social.mynacol.xyz/notice/BCAwZ0Oph4ZSQt2u6C

var SERVICES = ["blob", "file", "queue", "table", "dfs", "web"];

module.exports = {
  check_for_azurestorage_hostname: function (hostname) {
    if (!hostname) return false;

    // question.name carries a trailing dot; CNAME data usually does not.
    if (hostname[hostname.length - 1] === ".") {
      hostname = hostname.slice(0, -1);
    }

    var sdomains = hostname.split(".");

    // <service>.<cluster>.store.core.windows.net
    if (sdomains.length !== 6) return false;
    if (
      sdomains[2] !== "store" ||
      sdomains[3] !== "core" ||
      sdomains[4] !== "windows" ||
      sdomains[5] !== "net"
    ) {
      return false;
    }

    if (SERVICES.indexOf(sdomains[0]) === -1) return false;

    sdomains[0] = sdomains[0] + "-ds";
    return sdomains.join(".");
  },
};
