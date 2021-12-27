var ipRangeCheck = require("ip-range-check");

module.exports = {
    check_for_wordpressvip_ip: function (ipv4) {
        //console.log('wordpress vip ip check', ipv4);
        if (!ipv4) return false;

        return ipRangeCheck(ipv4, ["192.0.66.0/24"]);
    },
    wpvipv4to6: function (ipv4) {
        //console.log('f', ipv4);
        if (!ipv4) return false;

        var octets = ipv4.split(".");

        //console.log('octets', octets);

        //anycasted range
        var wpvip_range = '2a04:fa87:fffd::';

        var last_hex = decimalToHex(octets[0]) + decimalToHex(octets[1]) + ":" + decimalToHex(octets[2]) + decimalToHex(octets[3])
        //console.log('generated hex', last_hex);

        return wpvip_range + last_hex;
    }
};

function decimalToHex(d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }

    return hex;
}