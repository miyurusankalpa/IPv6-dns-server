module.exports = {
    check_for_oss_hostname: function (hostname) {
        if (!hostname) return false;
        var sdomains = hostname.split(".");
        sdomains.reverse();
        //console.log(sdomains);
    
        var dp0 = sdomains.indexOf("com");
        var dp1 = sdomains.indexOf("aliyuncs");
    
        if (dp0 == 0 && dp1 == 1) {
            //console.log(hostname+" aliyuncs matched");	
    
            var dpff1 = sdomains.indexOf("oss");
            //console.log("dpff1: "+dpff1);
    
            var ssdomains = sdomains[2].split("-");
    
            var dpff2 = ssdomains.indexOf("oss");
            //console.log("dpff2: "+dpff2);
    
            if(dpff1 == 2 && dpff2 == 0 && !sdomains[3]) { //match oss.aliyuncs.com
                //console.log("oss 3 matched");
                ssdomains[0] = "oss";
                ssdomains[1] = "cn";
                ssdomains[2] = "hangzhou";
            }
    
            if(dpff2==0)
            {
                //console.log(ssdomains);
    
                ssdomains.splice(0, 1); //delete oss from region domain
    
               // console.log(ssdomains);
    
                /*if(dpff1 == 2 && ssdomains.length == 1) { //match oss.aliyuncs.com
                    ssdomains[0] = "cn";
                    ssdomains[1] = "hangzhou";
                }
    
                console.log(ssdomains);*/
    
                //reattach the corrected region
                if(ssdomains.length!==0) sdomains[2] = ssdomains.join("-"); else sdomains.splice(2, 1);
    
                //console.log(sdomains);
    
                sdomains.splice(2, 0, "oss");
    
               //console.log(sdomains);
            } else return false;
    
            var fixedhostname = sdomains.reverse().join(".");
    
            return fixedhostname;
    
        } else return false;
    },

};
