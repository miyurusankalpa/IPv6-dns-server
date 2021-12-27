module.exports = {
    msev4tov6: function (ipv4, hostname) {
        //console.log('f', ipv4);
        if (!ipv4[0]) return false;

        var octets = ipv4[0].split(".");
        var mseid = hostname.split("-");
        //console.log('mseid', mseid[0]);

        //console.log('last octets', octets[3]);

        //anycasted range
        if (mseid[0] == 'a') var mse_range = '2620:1ec:c11::';
        if (mseid[0] == 'b') var mse_range = '2620:1ec:a92::';
        if (mseid[0] == 'c') var mse_range = '2a01:111:2003::';
        if (mseid[0] == 'l') var mse_range = '2620:1ec:21::';
        if (mseid[0] == 's') var mse_range = '2620:1ec:6::';
        if (mseid[0] == 'k') var mse_range = '2620:1ec:c::';
        if (mseid[0] == 't') var mse_range = '2620:1ec:bdf::';

        if (mseid[0] == 'spo') {
            var mse_range = '2620:1ec:8f8::';
            if (octets[3] == 9) octets[3] = 8;
        }

        if (!mse_range) {
            //console.log('unkown mseid');
            return;
        }

        if (ipv4.length == 1) {
            return mse_range + octets[3];
        }
    },
    check_for_microsoftedge_a: function (authority) {
        //console.log('a', authority);
        if (!authority) return false;
        if (authority.match(/msedge.net/g) !== null) {
            //console.log("microsoft edge matched");
            return true;
        } else return false;
    }
};
