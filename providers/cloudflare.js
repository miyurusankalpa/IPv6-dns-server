var ipRangeCheck = require("ip-range-check");

module.exports = {
  check_for_cloudflare_a: function (authority) {
    //console.log('a', authority);
    if (!authority) return false;
    if (authority == "dns.cloudflare.com") {
      //console.log("cloudflare matched");
      return true;
    } else return false;
  },
  check_for_cloudflare_hostname: function (hostname) {
    if (!hostname) return false;
    var sdomains = hostname.split(".");
    sdomains.reverse();
    var dp1 = sdomains.indexOf("net");
    var dp2 = sdomains.indexOf("cloudflare");
    var dp3 = sdomains.indexOf("cdn");

    if (dp1 === 0 && dp2 == 1 && dp3 == 2) {
      //console.log("cloudflare matched");
      return true;
    } else return false;
  },
  check_for_cloudflare_ip: function (ipv4) {
    //console.log('cloudflare ip check', ipv4);
    if (!ipv4) return false;

    return ipRangeCheck(ipv4, [
      // Cloudflare official IPv4 ranges (https://www.cloudflare.com/ips/)
      "103.21.244.0/22",
      "103.22.200.0/22",
      "103.31.4.0/22",
      "104.16.0.0/13",
      "104.24.0.0/14",
      "108.162.192.0/18",
      "131.0.72.0/22",
      "141.101.64.0/18",
      "162.158.0.0/15",
      "172.64.0.0/13",
      "173.245.48.0/20",
      "188.114.96.0/20",
      "190.93.240.0/20",
      "197.234.240.0/22",
      "198.41.128.0/17",
      // BYOIP ranges routed via Cloudflare (from bgp.he.net/cloudflare)
      "5.10.244.0/22", //Hollycorn N.V.
      "5.175.141.0/24", //noezIpleasede
      "5.226.179.0/24", //Hillside (Technology) Ltd
      "5.226.181.0/24", //HLM2 RIPE ADMIN
      "14.102.228.0/23", //Private Customer
      "23.141.168.0/24", //FST Networks LTD
      "23.145.136.0/24", //Databits LLC
      "23.145.152.0/24", //Cloud Extreme LLC
      "23.145.232.0/24", //Cloudify Ltd
      "23.145.248.0/24", //Spire Cloud Limited
      "23.167.152.0/24", //DataSphere Services Limited
      "23.178.112.0/24", //Internet Security Research Group
      "23.179.248.0/24", //Replai Network LLC
      "23.180.136.0/24", //World W3B LLC
      "23.247.163.0/24", //One
      "25.25.25.0/24", //Mathew Newton
      "25.26.27.0/24", //Mathew Newton
      "25.129.196.0/23", //Mathew Newton
      "25.129.198.0/23", //Mathew Newton
      "27.50.48.0/24", //BGP Network Limited
      "27.50.49.0/24", //BGP Network Limited
      "31.12.75.0/24", //Mikhail Tonkonog
      "31.43.179.0/24", //Betting company PM Bet
      "44.31.142.0/24", //Amateur Radio Digital Communications
      "45.8.211.0/24", //TANG DYNASTIC TECHNOLOGY PTE. LTD.
      "45.12.30.0/23", //Galaktika N.V.
      "45.80.108.0/24", //Welcomehost OU
      "45.80.110.0/24", //Welcomehost OU
      "45.80.111.0/24", //CloudKleyer Frankfurt GmbH
      "45.81.58.0/24", //Private Customer
      "45.85.118.0/23", //Galaktika N.V.
      "45.95.241.0/24", //Chrysalis Services Limited
      "45.131.4.0/22", //Panq B.V.
      "45.131.208.0/22", //Panq B.V.
      "45.135.235.0/24", //EZCS Solutions Ltd.
      "45.142.120.0/24", //It Saport Ltd.
      "45.149.12.0/24", //Lagom Solutions LLC
      "45.153.7.0/24", //ipx2
      "45.194.53.0/24", //Cloud Innovation Ltd
      "45.202.113.0/24", //G and M CENTRO ESPIRITUAL LLC
      "45.205.0.0/24", //OSA Management LLP
      "46.202.30.0/24", //Private Customer
      "62.72.166.0/24", //Private Customer
      "62.169.155.0/24", //CEVA Logistics Europe SA
      "64.69.24.0/23", //Workday, Inc.
      "65.205.150.0/24", //BORGWARNER LUXEMBOURG OPERATIONS SARL
      "66.45.118.0/24", //SavvyMoney, Inc.
      "66.81.247.0/24", //RingCentral Inc
      "66.81.255.0/24", //RingCentral Inc
      "66.94.32.0/22", //CloudScale365, Inc.
      "66.94.36.0/23", //CloudScale365, Inc.
      "66.94.38.0/24", //CloudScale365, Inc.
      "66.94.39.0/24", //CloudScale365, Inc.
      "66.94.40.0/21", //CloudScale365, Inc.
      "66.225.252.0/24", //Internet Utilities NA LLC
      "68.169.48.0/20", //Strategic Systems Consulting
      "69.48.218.0/24", //Uber Technologies, Inc.
      "69.89.0.0/20", //Strategic Systems Consulting
      "72.52.113.0/24", //IOPEX Technologies
      "74.49.214.0/23", //Private Customer
      "74.204.59.0/24", //Godwin Heights Public Schools
      "74.205.180.0/24", //Minacs Inc
      "77.37.33.0/24", //Private Customer
      "77.74.228.0/24", //Private Customer
      "77.75.199.0/24", //Private Customer
      "77.105.163.0/24", //Kuang Yu-Ting
      "77.232.140.0/24", //Tech Soft Solution
      "80.93.202.0/24", //Private Customer
      "83.118.224.0/22", //Euronet Communications B.V.
      "83.118.224.0/23", //Euronet Communications B.V.
      "83.118.226.0/23", //Euronet Communications B.V.
      "86.38.214.0/24", //SC Lithuanian Radio and TV Center
      "88.216.66.0/23", //Private Customer
      "89.47.56.0/23", //DataWeb Global Group B.V.
      "89.116.46.0/24", //Private Customer
      "89.116.161.0/24", //SC Lithuanian Radio and TV Center
      "89.116.180.0/24", //Private Customer
      "89.116.250.0/24", //SC Lithuanian Radio and TV Center
      "89.117.112.0/24", //Private Customer
      "89.207.18.0/24", //Chris Yates
      "91.124.127.0/24", //Private Customer
      "91.192.106.0/23", //DREAM CLOUD INNOVATION LIMITED
      "91.193.58.0/23", //DREAM CLOUD INNOVATION LIMITED
      "91.199.81.0/24", //Exit Games GmbH
      "91.209.253.0/24", //Naseej Technology JSC
      "92.53.188.0/22", //Private Customer
      "92.60.74.0/24", //TECHCORE HOLDING B.V.
      "92.243.74.0/24", //Hexo TechnologyLLC
      "92.243.75.0/24", //Hexo TechnologyLLC
      "93.114.64.0/23", //DataWeb Global Group B.V.
      "93.115.102.0/24", //Doctolib SAS
      "94.140.0.0/24", //Oryxlabs Technologies
      "94.247.142.0/24", //Bit Breakfast Ltd
      "102.177.176.0/24", //Gerondata LTD
      "102.177.189.0/24", //Cloudflare
      "103.11.212.0/24", //Hillside (Australia New Media) Pty Ltd
      "103.11.214.0/24", //Hillside (Australia New Media) Pty Ltd
      "103.15.85.0/24", //China Mobile Hong Kong Company Limited
      "103.19.144.0/23", //FUJIFILM Data Management Solutions Australia Pty Ltd
      "103.79.228.0/23", //Beijing Yunlian Interactive Technology Co., Ltd.
      "103.112.176.0/24", //Flinders Port Management Services PTY LTD
      "103.116.7.0/24", //Box, Inc
      "103.121.59.0/24", //Flinders Port Management Services PTY LTD
      "103.133.1.0/24", //Laravel
      "103.135.208.0/22", //DREAM CLOUD INNOVATION PTE. LTD.
      "103.169.142.0/24", //Canva Pty Ltd
      "103.172.110.0/23", //DREAM CLOUD INNOVATION PTE. LTD.
      "103.204.13.0/24", //DREAM CLOUD INNOVATION PTE. LTD.
      "104.36.195.0/24", //Uber Technologies, Inc.
      "104.129.164.0/22", //Internet Utilities NA LLC
      "104.234.239.0/24", //Private Customer
      "104.239.72.0/24", //Garmor Limited
      "104.254.140.0/24", //Armis
      "108.165.152.0/24", //Lease Packet Datacenter PVT. LTD
      "108.165.216.0/24", //Internet Utilities NA LLC
      "114.129.43.0/24", //Vista Group (NZ) Limited
      "130.108.73.0/24", //Wright State University
      "130.108.104.0/23", //Wright State University
      "130.108.121.0/24", //Wright State University
      "130.108.253.0/24", //Wright State University
      "136.143.138.0/24", //CEVA LOGISTICS U.S., INC.
      "138.5.248.0/24", //State University of New York Downstate Health Sciences University
      "139.64.234.0/24", //Tychron Corporation
      "139.64.235.0/24", //Tychron Corporation
      "141.11.202.0/23", //Fair Game Software KFT
      "141.193.213.0/24", //WPEngine, Inc.
      "147.78.140.0/24", //ISGBG EOOD
      "147.185.161.0/24", //MIGHTY SOFTWARE, INC.
      "151.243.128.0/22", //Private Customer
      "154.51.129.0/24", //Cogent Communications, LLC
      "154.51.160.0/24", //Cogent Communications, LLC
      "154.62.129.0/24", //Quostar Solutions Ltd
      "154.83.2.0/24", //Cloud Innovation Ltd
      "154.83.22.0/23", //Cloud Innovation Ltd
      "154.83.30.0/23", //Cloud Innovation Ltd
      "154.84.14.0/23", //Cloud Innovation Ltd
      "154.84.16.0/21", //Cloud Innovation Ltd
      "154.84.24.0/22", //Cloud Innovation Ltd
      "154.92.9.0/24", //SALO SOLUTIONS KFT
      "154.194.12.0/24", //RICH TOP EC LIMITED
      "154.197.64.0/24", //Magenta Favorita Unipessoal LDA
      "154.197.65.0/24", //SilverDeer B.V.
      "154.197.75.0/24", //Gerondata LTD
      "154.197.80.0/24", //Cloud Innovation Ltd
      "154.197.88.0/24", //Cloud Innovation Ltd
      "154.197.108.0/24", //Cloud Innovation Ltd
      "154.197.121.0/24", //MFI INVESTMENTS LIMITED
      "154.198.173.0/24", //Enterly Global Limited
      "154.202.89.0/24", //Socas International B.V.
      "154.206.12.0/24", //NOVOPLEX MARKETING LTD
      "154.211.8.0/24", //Maxunity Technology Sdn Bhd
      "154.218.15.0/24", //Xi'an Weikuai Network Technology Co., Ltd.
      "154.219.5.0/24", //Cloud Innovation Ltd
      "155.46.167.0/24", //Thomson Reuters U.S. LLC
      "155.46.213.0/24", //Thomson Reuters U.S. LLC
      "156.225.72.0/24", //GS TECHNOLOGIES LIMITED
      "156.243.246.0/24", //BAMLA LIMITED
      "156.252.2.0/23", //Cloud Innovation Ltd
      "159.112.235.0/24", //Confluence Technologies
      "159.246.55.0/24", //Crowe LLP
      "160.153.0.0/24", //GoDaddy.com, LLC
      "162.44.32.0/22", //IQVIA Holdings Inc
      "162.44.118.0/23", //IQVIA Holdings Inc
      "162.44.208.0/23", //IQVIA Holdings Inc
      "162.120.94.0/24", //Toast, Inc.
      "164.38.155.0/24", //Currys Retail Ltd.
      "167.1.148.0/24", //Concentrix CVG Corporation
      "167.1.149.0/24", //Concentrix CVG Corporation
      "167.1.150.0/24", //Concentrix CVG Corporation
      "167.1.181.0/24", //Concentrix CVG Corporation
      "167.68.4.0/24", //Thomson Reuters (Legal) Inc.
      "167.68.5.0/24", //Thomson Reuters (Legal) Inc.
      "167.68.11.0/24", //Thomson Reuters (Legal) Inc.
      "167.68.42.0/24", //Thomson Reuters (Legal) Inc.
      "170.114.45.0/24", //Zoom Video Communications, Inc.
      "170.114.46.0/24", //Zoom Video Communications, Inc.
      "170.114.52.0/24", //Zoom Video Communications, Inc.
      "170.114.78.0/24", //Zoom Video Communications, Inc.
      "170.176.152.0/24", //InTouch Health
      "172.83.72.0/24", //Trans Union, LLC
      "172.83.73.0/24", //Trans Union, LLC
      "172.83.76.0/24", //Trans Union, LLC
      "176.124.223.0/24", //Alex Group LLC
      "176.126.206.0/23", //DataWeb Global Group B.V.
      "178.211.142.0/24", //Eliptik Yazilim ve Ticaret A.S.
      "178.213.76.0/24", //Transporeon GmbH
      "181.214.1.0/24", //Private Customer
      "184.174.80.0/24", //Internet Utilities NA LLC
      "185.7.190.0/23", //Southern Communications Ltd
      "185.18.250.0/24", //SR-DC-Mad1
      "185.38.135.0/24", //Pirum Systems Limited
      "185.135.9.0/24", //Internet Utilities Europe and Asia Limited
      "185.148.104.0/24", //Dolgova Alena Andreevna
      "185.148.105.0/24", //Dolgova Alena Andreevna
      "185.148.106.0/24", //CYTechnology LLC
      "185.148.107.0/24", //NSS B.V.
      "185.159.247.0/24", //Welcomehost OU
      "185.162.228.0/23", //Softconstruct Limited
      "185.162.230.0/23", //Softconstruct Limited
      "185.170.166.0/24", //Playdom B.V.
      "185.176.24.0/24", //Horban Vasyl
      "185.176.26.0/24", //TOO NetBet
      "185.193.28.0/23", //F3 Markets N.V.
      "185.193.30.0/23", //F3 Markets N.V.
      "185.207.92.0/24", //Garmin International, Inc.
      "185.209.154.0/24", //Concentrix Europe Limited
      "185.238.228.0/24", //Invermae Solutions SL
      "188.42.88.0/24", //Servers Guy
      "188.42.89.0/24", //Servers Guy
      "188.42.145.0/24", //Servers Guy
      "188.164.158.0/23", //AMWEB LLC
      "188.164.248.0/24", //Webzilla B.V.
      "188.244.122.0/24", //CloudKleyer Frankfurt GmbH
      "192.65.217.0/24", //Victoria University
      "192.133.11.0/24", //Progress Software
      "192.152.138.0/24", //Capitol Indemnity Corporation
      "192.236.26.0/24", //Aera Technology, Inc.
      "193.9.49.0/24", //CloudKleyer Frankfurt GmbH
      "193.16.63.0/24", //BorgWarner IT Services Europe GmbH
      "193.17.206.0/24", //DELTEK DANMARK A/S
      "193.22.229.0/24", //EZCS Solutions Ltd.
      "193.67.144.0/24", //BorgWarner
      "193.162.35.0/24", //XNNET LIMITED
      "193.227.99.0/24", //Avento Mt Limited
      "193.233.21.0/24", //AEZA GROUP Ltd
      "193.233.132.0/24", //AEZA GROUP Ltd
      "194.1.194.0/24", //Dunnhumby Ltd
      "194.26.68.0/24", //CEVA France SASU
      "194.36.49.0/24", //Hogg Robinson Limited
      "194.36.55.0/24", //Hogg Robinson Limited
      "194.39.112.0/21", //KUMAGroup Holding GmbH
      "194.53.53.0/24", //TANG DYNASTIC TECHNOLOGY PTE. LTD.
      "194.59.5.0/24", //Bonami LLP
      "194.113.223.0/24", //Kestas Pet
      "194.152.44.0/24", //DEMENIN B.V.
      "194.169.194.0/24", //WEATHERBYS LTD
      "195.26.229.0/24", //Anneten Resources Ltd
      "195.28.190.0/24", //RSA INSURANCE GROUP PLC
      "195.28.191.0/24", //RSA INSURANCE GROUP PLC
      "195.85.23.0/24", //Lotuna Management s.r.o.
      "195.85.59.0/24", //NXA Global Online Services Ltd.
      "195.189.177.0/24", //RSA INSURANCE GROUP PLC
      "195.250.46.0/24", //Avaloq Group AG
      "196.13.241.0/24", //CAPITEC BANK LIMITED
      "196.207.45.0/24", //CloudFare Assignment from Vodacom
      "198.177.56.0/24", //Prime Formation GmbH
      "198.177.57.0/24", //Prime Formation GmbH
      "198.202.211.0/24", //Webflow, Inc.
      "199.5.242.0/24", //Sage Software, Inc.
      "199.33.230.0/24", //.gov TLD
      "199.33.231.0/24", //.gov TLD
      "199.33.232.0/24", //.gov TLD
      "199.33.233.0/24", //.gov TLD
      "199.60.103.0/24", //HubSpot, Inc.
      "199.181.197.0/24", //Zenfolio, Inc.
      "200.73.67.0/24", //TIVIT CHILE
      "202.82.250.0/24", //Hong Kong Telecommunications (HKT) Limited
      "203.6.66.0/24", //Australian Defence Organization
      "203.6.74.0/24", //Australian Defence Organization
      "203.13.32.0/24", //LACHTARISTO HOLDINGS LIMITED
      "203.17.126.0/24", //LACHTARISTO HOLDINGS LIMITED
      "203.19.222.0/24", //DHA-GATEWAY
      "203.22.223.0/24", //LACHTARISTO HOLDINGS LIMITED
      "203.22.241.0/24", //Elsevier Limited
      "203.23.103.0/24", //UMPIRE ASSOCIATES LTD
      "203.23.104.0/24", //LACHTARISTO HOLDINGS LIMITED
      "203.23.106.0/24", //LACHTARISTO HOLDINGS LIMITED
      "203.24.102.0/24", //ANAGA CONSULTING LIMITED
      "203.24.103.0/24", //ANAGA CONSULTING LIMITED
      "203.24.108.0/24", //LACHTARISTO HOLDINGS LIMITED
      "203.24.109.0/24", //UMPIRE ASSOCIATES LTD
      "203.28.8.0/24", //LACHTARISTO HOLDINGS LIMITED
      "203.28.9.0/24", //LACHTARISTO HOLDINGS LIMITED
      "203.29.52.0/24", //ANAGA CONSULTING LIMITED
      "203.29.53.0/24", //LACHTARISTO HOLDINGS LIMITED
      "203.29.54.0/23", //UMPIRE ASSOCIATES LTD
      "203.30.188.0/22", //UMPIRE ASSOCIATES LTD
      "203.32.120.0/23", //ANAGA CONSULTING LIMITED
      "203.34.28.0/24", //ANAGA CONSULTING LIMITED
      "203.34.80.0/24", //ANAGA CONSULTING LIMITED
      "203.55.107.0/24", //ANAGA CONSULTING LIMITED
      "203.89.5.0/24", //26 Brisbane Ave
      "203.168.128.0/22", //DREAM CLOUD INNOVATION PTE. LTD.
      "204.62.141.0/24", //UFP Industries, Inc.
      "204.68.111.0/24", //American Internet Services, LLC.
      "205.233.181.0/24", //Taulia Inc
      "207.189.149.0/24", //Qumu, INC
      "208.42.188.0/24", //Vanco Payment Solutions
      "208.77.33.0/24", //CEVA LOGISTICS U.S., INC.
      "208.77.35.0/24", //CEVA LOGISTICS U.S., INC.
      "208.100.60.0/24", //Branzone, Inc.
      "209.46.30.0/24", //ADVERTISING SPECIALTY INSTITUTE, INC.
      "209.222.114.0/24", //Hypixel, Inc
      "209.222.115.0/24", //Hypixel, Inc
      "212.239.86.0/24", //CASSA DI COMPENSAZIONE E GARANZIA SPA
      "213.182.199.0/24", //Andrey Voskresenskiy
      "213.219.247.0/24", //AEZA GROUP Ltd
      "213.241.198.0/24", //SRAVNI-RU
      "216.120.131.0/24", //American Registry for Internet Numbers
      "216.120.180.0/23", //Exit Games GmbH
      "216.154.208.0/20", //Strategic Systems Consulting
      "216.198.53.0/24", //Zendesk, Inc.
      "216.198.54.0/24", //Zendesk, Inc.
      "216.205.52.0/24", //Olo Inc.
      "223.27.176.0/23", //FUJIFILM Data Management Solutions Australia Pty Ltd
    ]);
  },
  getcloudflarev6address: function () {
    return "2606:4700::6810:bad"; //will give SSL_ERROR_NO_CYPHER_OVERLAP on non cloudflare sites on aggressive mode
  },
  check_for_shopify_hostname: function (hostname) {
    if (!hostname) return false;
    var sdomains = hostname.split(".");
    sdomains.reverse();
    var dp1 = sdomains.indexOf("com");
    var dp2 = sdomains.indexOf("shopify");
    var dp3 = sdomains.indexOf("myshopify");

    if (dp1 === 0 && (dp2 == 1 || dp3 == 1)) {
      //console.log("shopify matched");
      return hostname;
    } else return false;
  },
  check_for_shopify_ip: function (ipv4) {
    //console.log('shopify ip check', ipv4);
    if (!ipv4) return false;

    return ipRangeCheck(ipv4, [
      "23.227.37.0/24",
      "23.227.38.0/23",
      "23.227.60.0/24",
      "185.146.172.0/23",
    ]);
  },
  getshopifyv6address: function () {
    return "2620:127:f00f::";
  },
  check_for_webflow_hostname: function (hostname) {
    if (!hostname) return false;
    var sdomains = hostname.split(".");
    sdomains.reverse();
    var dp1 = sdomains.indexOf("com");
    var dp2 = sdomains.indexOf("webflow");

    if (dp1 === 0 && dp2 == 1) {
      //console.log("webflow matched");
      return hostname;
    } else return false;
  },
  check_for_webflow_ip: function (ipv4) {
    //console.log('webflow ip check', ipv4);
    if (!ipv4) return false;

    return ipRangeCheck(ipv4, [
      "198.202.211.0/24",
      "75.2.70.75/32", //aacb0a264e514dd48.awsglobalaccelerator.com
      "99.83.190.102/32", //aacb0a264e514dd48.awsglobalaccelerator.com
    ]);
  },
  getwebflowv6address: function () {
    return "2620:cb:2000::1";
  },
};
