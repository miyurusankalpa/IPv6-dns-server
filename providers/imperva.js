// Imperva (Incapsula) dual-stack mapping.
//
// Imperva-protected hostnames CNAME to <label>.x.incapdns.net or
// <label>.ng.impervadns.net and only publish A records. The same sites also
// answer on 2a02:e980::/29 over IPv6 as <pop /48>::<last IPv4 octet in hex>.
//
// The /48 identifies the Imperva PoP. It is a per-/24 allocation (not derivable
// from the address), and a /24 is usually served by more than one PoP, so the
// table below is the only reliable way to keep the address in the right DC.
// Unknown /24s fall back to DEFAULT_POP, which still serves every site.
//
// Table derived from a PTR/A corpus contributed by @miyuru.

var ipRangeCheck = require("ip-range-check");

var V4_RANGES = [
  "45.60.0.0/16",
  "45.64.64.0/22",
  "45.223.0.0/16",
  "103.28.248.0/22",
  "107.154.0.0/16",
  "131.125.128.0/17",
  "149.126.72.0/21",
  "185.11.124.0/22",
  "192.230.64.0/18",
  "198.143.32.0/19",
  "199.83.128.0/21",
];

var DEFAULT_POP = "2a02:e980:f4";

// IPv4 /24 -> serving Imperva PoP /48s.
var POPS = {
  "45.60.12": ["2a02:e980:135", "2a02:e980:b2"],
  "45.60.15": ["2a02:e980:b3", "2a02:e980:b5"],
  "45.60.31": ["2a02:e980:11a", "2a02:e981:44"],
  "45.60.32": ["2a02:e981:45"],
  "45.60.36": ["2a02:e980:d5"],
  "45.60.37": ["2a02:e980:d0"],
  "45.60.38": ["2a02:e980:d1"],
  "45.60.41": ["2a02:e980:24b", "2a02:e980:a"],
  "45.60.45": ["2a02:e980:de", "2a02:e980:e0"],
  "45.60.47": ["2a02:e980:e0", "2a02:e980:e4"],
  "45.60.62": ["2a02:e980:11e"],
  "45.60.66": ["2a02:e980:f4"],
  "45.60.67": ["2a02:e980:f1"],
  "45.60.83": ["2a02:e980:ab", "2a02:e980:ad"],
  "45.60.96": ["2a02:e980:117", "2a02:e980:7e"],
  "45.60.99": ["2a02:e980:138"],
  "45.60.102": ["2a02:e980:135"],
  "45.60.103": ["2a02:e980:d0", "2a02:e980:d2"],
  "45.60.104": ["2a02:e980:11b", "2a02:e980:d1", "2a02:e980:d3"],
  "45.60.107": ["2a02:e980:f0", "2a02:e980:11e"],
  "45.60.108": ["2a02:e980:11f", "2a02:e980:f1"],
  "45.60.110": ["2a02:e980:53", "2a02:e980:55", "2a02:e980:139"],
  "45.60.121": ["2a02:e980:127", "2a02:e981:4c"],
  "45.60.122": ["2a02:e980:128"],
  "45.60.124": ["2a02:e980:12a", "2a02:e980:12c", "2a02:e980:12e"],
  "45.60.126": ["2a02:e980:128", "2a02:e980:12a", "2a02:e980:12c"],
  "45.60.132": ["2a02:e980:12a"],
  "45.60.136": ["2a02:e980:a7", "2a02:e980:af"],
  "45.60.151": ["2a02:e980:13e", "2a02:e980:e6"],
  "45.60.154": ["2a02:e980:f9"],
  "45.60.155": ["2a02:e980:107"],
  "45.60.166": ["2a02:e980:114"],
  "45.60.195": ["2a02:e981:2a", "2a02:e981:32"],
  "45.60.197": ["2a02:e981:2c"],
  "45.60.199": ["2a02:e981:2e"],
  "45.60.241": ["2a02:e980:146"],
  "45.60.251": ["2a02:e980:150"],
  "45.64.64": ["2a02:e980:18", "2a02:e980:19"],
  "45.223.18": ["2a02:e980:1fd"],
  "45.223.57": ["2a02:e980:18e", "2a02:e980:19d"],
  "45.223.63": ["2a02:e980:18e", "2a02:e980:194"],
  "45.223.82": ["2a02:e980:226"],
  "45.223.102": ["2a02:e980:1c1", "2a02:e980:1da"],
  "45.223.103": ["2a02:e980:1c7"],
  "45.223.141": ["2a02:e980:162"],
  "45.223.161": ["2a02:e980:186"],
  "45.223.163": ["2a02:e980:188"],
  "45.223.181": ["2a02:e980:172"],
  "45.223.183": ["2a02:e980:174"],
  "107.154.75": ["2a02:e980:57"],
  "107.154.77": ["2a02:e980:59", "2a02:e980:5b"],
  "107.154.79": ["2a02:e980:133", "2a02:e980:58"],
  "107.154.85": ["2a02:e980:5d", "2a02:e980:65"],
  "107.154.84": ["2a02:e980:5d", "2a02:e980:65"],
  "107.154.110": ["2a02:e980:3d", "2a02:e980:3f"],
  "107.154.158": ["2a02:e980:61"],
  "107.154.159": ["2a02:e980:62"],
  "107.154.161": ["2a02:e980:64", "2a02:e980:6c"],
  "107.154.165": ["2a02:e980:69"],
  "107.154.166": ["2a02:e980:6a"],
  "107.154.192": ["2a02:e980:2c"],
  "107.154.196": ["2a02:e980:2d"],
  "107.154.194": ["2a02:e980:2f"],
  "107.154.212": ["2a02:e980:53"],
  "107.154.247": ["2a02:e980:51"],
  "107.154.248": ["2a02:e980:51", "2a02:e980:53"],
  "107.154.249": ["2a02:e980:55"],
  "192.230.122": ["2a02:e980:5"],
  "192.230.123": ["2a02:e980:6"],
  "192.230.74": ["2a02:e980:11", "2a02:e980:13", "2a02:e980:17"],
  "199.83.128": ["2a02:e980:f"],
  "199.83.129": ["2a02:e980:16"],
  "199.83.131": ["2a02:e980:15"],
  "199.83.132": ["2a02:e980:f"],
  "199.83.135": ["2a02:e980:13", "2a02:e980:17"],
};

function last_octet_hex(ipv4) {
  var octets = ipv4.split(".");
  if (octets.length !== 4) return false;

  var last = parseInt(octets[3], 10);
  if (isNaN(last) || last < 0 || last > 255) return false;

  return last.toString(16);
}

module.exports = {
  check_for_imperva_hostname: function (hostname) {
    if (!hostname) return false;

    hostname = hostname.toLowerCase();
    if (hostname[hostname.length - 1] === ".") {
      hostname = hostname.slice(0, -1);
    }

    var labels = hostname.split(".");
    if (labels.length < 3) return false;

    var tld = labels[labels.length - 1];
    var domain = labels[labels.length - 2];

    return tld === "net" && (domain === "incapdns" || domain === "impervadns");
  },
  check_for_imperva_ip: function (ipv4) {
    if (!ipv4) return false;

    return ipRangeCheck(ipv4, V4_RANGES);
  },
  getv6addresses: function (ipv4) {
    var host = last_octet_hex(ipv4);
    if (!host) return [];

    var net = ipv4.split(".").slice(0, 3).join(".");
    var pops = POPS[net] || [DEFAULT_POP];

    return pops.map(function (pop) {
      return pop + "::" + host;
    });
  },
  getdefaultv6address: function () {
    return DEFAULT_POP + "::b0";
  },
};
