module.exports = {
  check_for_oss_hostname: function (hostname) {
    if (!hostname) return false;
    var sdomains = hostname.split(".");
    sdomains.reverse();
    //console.log(sdomains);

    var dp0 = sdomains.indexOf("com");
    var dp1 = sdomains.indexOf("aliyuncs");
    var dp2 = sdomains.indexOf("aliyun-inc");

    //change the domain
    if (dp2 == 1) sdomains[1] = "aliyuncs";

    if (dp0 == 0 && (dp1 == 1 || dp2 == 1)) {
      //console.log(hostname+" aliyuncs matched");

      var dpff1 = sdomains.indexOf("oss");
      //console.log("dpff1: "+dpff1);

      var ssdomains = sdomains[2].split("-");
      //if(sdomains.length==4 && dpff1<0) var ssdomains = sdomains[3].split("-"); else var ssdomains = sdomains[2].split("-")

      var dpff2 = ssdomains.indexOf("oss");
      //console.log("dpff2: "+dpff2);

      if (dpff1 == 2 && dpff2 == 0 && sdomains[3]) {
        //match oss.aliyuncs.com
        var ssdomains = sdomains[3].split("-");
        var ssdoaminloc = 3;
        //console.log("oss 3 matched");
        // ssdomains[0] = "oss";
        //ssdomains[1] = "cn";
        //ssdomains[2] = "hangzhou";
      } else var ssdoaminloc = 2;

      var dpff3 = ssdomains.indexOf("oss");
      //console.log("dpff3: "+dpff3);

      //if(dpff2==0)
      // {
      //console.log("regi "+ssdomains);

      //delete bucketname
      if (sdomains.length == 4 && dpff1 < 0) sdomains.splice(3, 1);

      if (dpff3 == 0) ssdomains.splice(0, 1); //delete oss from region domain

      if (ossRegions.indexOf(ssdomains.join("-")) !== -1) var isbucket = true;
      else var isbucket = false;

      //console.log(sdomains);

      if (dpff1 == 2 && !isbucket) {
        //match oss.aliyuncs.com
        ssdomains[0] = "cn";
        ssdomains[1] = "hangzhou";
      }

      //console.log(ssdomains);

      //reattach the corrected region
      if (ssdomains.length !== 0) sdomains[ssdoaminloc] = ssdomains.join("-");
      else sdomains.splice(2, 1);

      //console.log(sdomains);

      if (dpff3 == 0) sdomains.splice(2, 0, "oss");

      //console.log(sdomains);
      //} else return false;

      var fixedhostname = sdomains.reverse().join(".");

      return fixedhostname;
    } else return false;
  },
};

const ossRegions = [
  "cn-hangzhou",
  "cn-shanghai",
  "cn-nanjing",
  "cn-qingdao",
  "cn-beijing",
  "cn-zhangjiakou",
  "cn-huhehaote",
  "cn-wulanchabu",
  "cn-shenzhen",
  "cn-heyuan",
  "cn-guangzhou",
  "cn-chengdu",
  "cn-hongkong",
  "us-west-1",
  "us-east-1",
  "ap-southeast-1",
  "ap-southeast-2",
  "ap-southeast-3",
  "ap-southeast-4",
  "ap-southeast-5",
  "ap-southeast-6",
  "ap-southeast-7",
  "ap-northeast-1",
  "ap-northeast-2",
  "ap-south-1",
  "eu-central-1",
  "eu-west-1",
  "me-east-1",
  "me-central-1",
  "cn-hangzhou-finance",
  "cn-shanghai-finance",
  "cn-shenzhen-finance",
  "cn-beijing-finance-1",
  "cn-beijing-finance-2",
];
