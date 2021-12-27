module.exports = {
    check_for_cdn77_a: function (authority) {
        //console.log('a', authority);
        if (!authority) return false;
        if (authority == 'cdn77.org') {
            //console.log("cdn77 matched");
            return true;
        } else return false;
    },

};
