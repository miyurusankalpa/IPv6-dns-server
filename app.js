'use strict';

const config = require('./config.json');

//use a EDNS enabled DNS resolver for best results
var dns_resolver = config.dns_resolver;

let dns = require('native-dns');
let async = require('async');
let localStorageMemory = require('localstorage-memory');
let ipaddr = require('ipaddr.js');
let ipRangeCheck = require("ip-range-check");

var akamai = require('./providers/akamai');
var fastly = require('./providers/fastly');
var awss3 = require('./providers/awss3');
var cloudflare = require('./providers/cloudflare');
var cloudfront = require('./providers/cloudfront');
var msedge = require('./providers/msedge');
var edgecast_windows = require('./providers/edgecast_windows');
var limelight = require('./providers/limelight');
var bunnycdn = require('./providers/bunnycdn');
var sucuri = require('./providers/sucuri');
var weebly = require('./providers/weebly');
var wpvip = require('./providers/wpvip');
var cdn77 = require('./providers/cdn77');
var alibabaoss = require('./providers/alibabaoss');
var alicdn = require('./providers/alicdn');
//var msidentity = require('./providers/msidentity');
var netlify = require('./providers/netlify');
var bearblog = require('./providers/bearblog');
var inwx = require('./providers/inwx');
var blazingcdn = require('./providers/blazingcdn');
var gcorecdn = require('./providers/gcorecdn');
var azurewebsites = require('./providers/azurewebsites')
var awsglb = require('./providers/awsglobalaccelerator');

const {
    Resolver
} = require('dns');
const awsglobalaccelerator = require('./providers/awsglobalaccelerator');

const resolver = new Resolver();
const resolver_own = new Resolver();

const self_server_and_port = "["+config.self_resolver+"]:"+config.self_port;

resolver.setServers([dns_resolver]);
resolver_own.setServers([self_server_and_port]);

let server6 = dns.createServer({
    dgram_type: 'udp6',
});

server6.on('listening', () => console.log('server listening on', server6.address()));
server6.on('close', () => console.log('server closed', server6.address()));
server6.on('error', (err, buff, req, res) => console.error(err.stack));
server6.on('socketError', (err, socket) => console.error(err));

server6.serve(config.self_port, config.self_resolver);

let authority = {
    address: dns_resolver,
    port: 53,
    type: 'udp6'
};

var no_aaaa = config.no_aaaa;
var add_aaaa = config.add_aaaa;

var aggressive_v6 = config.aggressive_v6;
var v6_only = config.v6_only;
var remove_v4_if_v6_exist = config.remove_v4_if_v6_exist;
var dns64 = config.dns64;

var dns64_range = config.dns64_range; // "/96 CIDR assumed by default"

add_aaaa["scholar.google.com"] = "scholar.googleusercontent.com"; //Thanks @Mynacol https://codeberg.org/IPv6-Monostack/delegacy-rpz/pulls/53

if (aggressive_v6) {
    add_aaaa["store.steampowered.com"] = "akamai|e11698.b.akamai.net";
}

// Block AAAA records for www.jbl.com and *.jbl.com subdomains: for #15
function isBlockedDomain(name) {
    if (name === "www.jbl.com") return true;
    if (/^[a-z]{2}\.jbl\.com$/.test(name)) return true;
    return false;
}

function isApexDomain(domainName) {
    // 1. Basic validation: ensure it's a non-empty string.
    if (typeof domainName !== 'string' || domainName.length === 0) {
      return false;
    }

    // 2. Split the domain name by the dot.
    const parts = domainName.split('.');

    // 3. An apex domain should split into exactly two parts,
    //    and neither part should be empty.
    return parts.length === 2 && parts[0].length > 0 && parts[1].length > 0;
  }

//cache fastly range on starup
fastly.getfastlyv6address('fastly', resolver, localStorageMemory);

function handleRequest(request, response) {
    var question = request.question[0];
    console.log('request from', request.address.address, 'for', question.name);
    //console.log('questions', request.question);

    let f = []; // array of functions

    // proxy all questions
    // since proxying is asynchronous, store all callbacks
    request.question.forEach(question => {

        if (question.type === 28) //AAAA records
        {
            if (isBlockedDomain(question.name)) {   // add to doamin to NoAAAA if matched from block domain
                no_aaaa.push(question.name);
            }

            if (question.name.startsWith("_noaaaa.")) { //subdomain with _noaaa
                no_aaaa.push(question.name.substr(8)); //add it to list without noaaaa subdomain
            }

            if (no_aaaa.indexOf(question.name) !== -1 & !dns64) {
                response.header.rcode = 0;
                response.send();
                return;
            }

            //do not serve from cache if we have match from A
            /*if(!add_aaaa[question.name]) var cachedaaaaresponse = JSON.parse(localStorageMemory.getItem(question.name));

            if (cachedaaaaresponse) {
                //console.log(question.name, 'cached');
                response.answer = cachedaaaaresponse;
                response.send();
                return;
            }*/
        }

        if (question.type === 1) //A records
        {
            if (v6_only) {
                response.header.rcode = 0;
                response.send();
                return;
            }
        }

        f.push(cb => proxy(question, response, cb));
    });

    // do the proxying in parallel
    // when done, respond to the request by sending the response
    async.parallel(f, function () {
        //console.log('response', response);
        response.send();
    });
}

function proxy(question, response, cb) {
    //console.log('proxying', JSON.stringify(question));

    var request = dns.Request({
        question: question, // forwarding the question
        server: authority, // this is the DNS server we are asking
        timeout: 1000
    });

    request.on('timeout', function () {
        console.log('Timeout in making request no forwarding', question.name);
    });

    // when we get answers, append them to the response
    request.on('message', (err, msg) => {

        //console.log('message', msg);

        if (question.type === 28) //AAAA records
        {
            var last_hostname, matched_hostname;
            var last_type;
            var matched = false;

            msg.answer.forEach(aaaa => {
                response.answer.push(aaaa);
                //console.log('remote DNS response: ', aaaa)
                last_hostname = aaaa.data;
                last_type = aaaa.type;

                if (aaaa.data && aaaa.data.includes('.azurewebsites.windows.net')) { //dirty hack to give the domain to process for azure websites
                    matched_hostname = aaaa.data;
                }
            });

            if (last_type === 28) { //skip if there are AAAA records
                cb();
                return;
            }

            var getcdn = add_aaaa[question.name];

            //console.log(add_aaaa);

            var fsta;
            var ak;
            var s3;
            var v0c;
            var cfl;
            var cfr;
            var mse;
            var gio;
            var bun;
            var sui;
            var wb;
            var c77;
            var ll;
            var oss;
            var ali;
            //var msi;
            var shp;
            var net;
            var bear;
            var inx;
            var wef;
            var blz;
            var gco;
            var azw;
            var awsglb;

            if (getcdn) {
                var providers = add_aaaa[question.name].split("|");
                var provider_name = providers[0];

                //console.log('custom', provider_name);
                switch (provider_name) {
                    case 'fastly':
                        fsta = true;
                        break;
                    case 'akamai':
                        ak = akamai.check_for_akamai_hostname(providers[1]);
                        break;
                    case 's3':
                        s3 = true;
                        break;
                    case 'cloudflare':
                        cfl = true;
                        break;
                    case 'cloudfront':
                        cfr = true;
                        break;
                    case 'msedge':
                        mse = true;
                        break;
                    case 'githubio':
                        gio = true;
                        break;
                    case 'edgecast_windows':
                        v0c = true;
                        break;
                    case 'bunnycdn':
                        bun = true;
                        break;
                    case 'sucuri':
                        sui = true;
                        break;
                    case 'weebly':
                        wb = true;
                        break;
                    case 'cdn77':
                        c77 = true;
                        break;
                    case 'limelight':
                        ll = true;
                        break;
                    case 'oss':
                        oss = true;
                        break;
                    case 'alicdn':
                        ali = true;
                        break;
                    case 'msidentity':
                        msi = true;
                        break;
                    case 'shopify':
                        shp = true;
                        break;
                    case 'webflow':
                        wef = true;
                        break;
                    case 'netlify':
                        net = true;
                        break;
                    case 'bearblog':
                        bear = true;
                        break;
                    case 'blazingcdn':
                        blz = true;
                        break;
                    case 'gcorecdn':
                        gco = true;
                        break;
                    case 'azureweb':
                        azw = true;
                        break;
                    case 'awsglb':
                        awsglb = true;
                        break;
                    case 'inwx':
                        inx = true;
                        var inwx_ptr = providers[1];
                        break;
                    default: {
                    //matched = true;
                    if (ipaddr.isValid(provider_name) && ipaddr.parse(provider_name).kind() === 'ipv6') {
                        handleResponse(5, response, question.name, provider_name, cb); // only ipv6 address
                    } else {
                        resolver.resolve6(provider_name, (err, addresses) => {
                            if (addresses && addresses.length > 0) {
                                handleResponse(5, response, question.name, addresses, cb);
                            }
                        });
                    }
                    }
                }
            }

            if (last_hostname == undefined) {
                last_hostname = question.name;
                last_type = 5;
            }

            //console.log('lh', last_hostname);

            if (!ak) ak = akamai.check_for_akamai_hostname(last_hostname);
            if (ak) {
                matched = true;
                resolver.resolve6(ak, (err, addresses) => {
                    if (addresses != undefined) handleResponse(last_type, response, last_hostname, addresses, cb); else{ cb(); return; }
                });
                return;
            }

            if (!azw) azw = azurewebsites.check_for_azureweb_hostname(matched_hostname);
            if (azw) {
                matched = true;
                resolver.resolve6(azw, (err, addresses) => {
                    if (addresses != undefined) handleResponse(last_type, response, last_hostname, addresses, cb); else{ cb(); return; }
                });
                return;
            }

            //disabled due to bad request error
            /*if (!msi && aggressive_v6) msi = msidentity.check_for_msidentity_hostname(last_hostname);
            if (msi) {
                matched = true;
                resolver.resolve6(msi, (err, addresses) => {
                    if (addresses != undefined) handleResponse(last_type, response, last_hostname, addresses, cb); else{ cb(); return; }
                });
                return;
            }*/

            if (!s3) s3 = awss3.check_for_s3_hostname(question.name);
            if (!s3 && aggressive_v6) s3 = awss3.check_for_s3_hostname(last_hostname);
            if (s3) {
                matched = true;
                resolver.resolve6(s3, (err, addresses) => {
                    if (addresses != undefined) handleResponse(last_type, response, last_hostname, addresses, cb); else{ cb(); return; }
                });
                return;
            }

            if (!oss) oss = alibabaoss.check_for_oss_hostname(question.name);
            if (oss) {
                matched = true;
                resolver.resolve6(oss, (err, addresses) => {
                    if (addresses != undefined) handleResponse(last_type, response, last_hostname, addresses, cb); else{ cb(); return; }
                });
                return;
            }

            if (msg.authority[0]) var authority = msg.authority[0].admin;
            else var authority = 'none';
            if (msg.authority[0]) var authorityname = msg.authority[0].name;
            else var authorityname = 'none';

            if (gio) {
                matched = true;
                fsta = true;
            }

            if (!fsta) fsta = fastly.check_for_fastly_a(authority);
            if (fsta) {
                matched = true;
                resolver.resolve4(last_hostname, (err, v4addresses) => {
                    //console.log(v4addresses);
                    var fv6 = fastly.fastlyv4tov6(v4addresses, resolver, localStorageMemory);

                    if (!fv6) {
                        fastly_fallback();
                        //cb();
                        //return;
                    }

                    handleResponse(last_type, response, last_hostname, fv6, cb);
                });
                return;
            }

            if (!fsta) fastly_fallback(); //check the hostname if authority is not matched

            function fastly_fallback() {
                var fsta1 = fastly.check_for_fastly_hostname(last_hostname);
                //console.log(fsta1);

                if (fsta1 && fsta1[0] == "d") { //check for "d"ualstack in the hostname
                    matched = true; fsta = fsta1;
                    resolver.resolve6(fsta1, (err, addresses) => {
                        if (addresses != undefined) handleResponse(last_type, response, last_hostname, addresses, cb); else { cb(); return; }
                    });
                    return;
                }
            }

            if (!mse) mse = msedge.check_for_microsoftedge_a(authorityname);
            if (mse) {
                matched = true;
                resolver.resolve4(last_hostname, (err, v4addresses) => {
                    //console.log(v4addresses);
                    var mv6 = msedge.msev4tov6(v4addresses, authorityname);

                    if (!mv6) {
                        cb();
                        return;
                    }

                    handleResponse(last_type, response, last_hostname, mv6, cb);
                    return;
                });

            }

            if (!cfr) cfr = cloudfront.check_for_cloudfront_hostname(last_hostname);
            if (cfr) {
                matched = true;
                cloudfront.getcloudfrontv6address(resolver, localStorageMemory, (err, addresses) => {
                    if (addresses != undefined) handleResponse(last_type, response, last_hostname, addresses, cb); else { cb(); return; }
                });
            }

            if (!bun) bun = bunnycdn.check_for_bunnycdn_hostname(last_hostname);
            if (bun) {
                matched = true;
                var bv6address = bunnycdn.getbunnycdnv6address(resolver, localStorageMemory);
                handleResponse(last_type, response, last_hostname, bv6address, cb);
                return;
            }

            if (!blz) blz = blazingcdn.check_for_blazingcdn_hostname(last_hostname);
            if (blz) {
                matched = true;
                blazingcdn.getblazingcdnv6address(resolver, localStorageMemory, (err, addresses) => {
                    if (addresses != undefined) handleResponse(last_type, response, last_hostname, addresses, cb); else { cb(); return; }
                });
                return;
            }

            if (!gco) gco = gcorecdn.check_for_gcorecdn_hostname(last_hostname);
            if (gco) {
                matched = true;
                gcorecdn.getgcorecdnv6address(resolver, localStorageMemory, (err, addresses) => {
                    if (addresses != undefined) handleResponse(last_type, response, last_hostname, addresses, cb); else { cb(); return; }
                });;
                return;
            }

            if (!c77) c77 = cdn77.check_for_cdn77_a(authority);
            if (!c77) c77 = cdn77.check_for_cdn77_hostname(last_hostname);
            if (c77) {
                matched = true;
                cdn77.get_cdn77_v6address(resolver, localStorageMemory, (err, addresses) => {
                    if (addresses != undefined) handleResponse(last_type, response, last_hostname, addresses, cb); else { cb(); return; }
                });;
                return;
            }

            if (!awsglb) awsglb = awsglobalaccelerator.check_for_awsglb_hostname(last_hostname);
            if (awsglb) {
                matched = true;
                resolver.resolve6(awsglb, (err, addresses) => {
                    //console.log('awsglb', addresses);
                    if (addresses != undefined) handleResponse(last_type, response, last_hostname, addresses, cb); else { cb(); return; }
                });
                return;
            }

            if (!wb) wb = weebly.check_for_weebly_hostname(last_hostname);
            if (wb) {
                matched = true;
                var wbv6address = weebly.getweeblyv6address();
                handleResponse(last_type, response, last_hostname, wbv6address, cb);
                return;
            }

            if (!v0c) v0c = edgecast_windows.check_for_v0cdn_hostname(last_hostname);
            if (v0c) {
                matched = true;
                resolver.resolve6(v0c, (err, addresses) => {
                    if (addresses != undefined) handleResponse(last_type, response, last_hostname, addresses, cb); else return;
                });
                return;
            }

            if (!ll) ll = limelight.check_for_lln_hostname(last_hostname);
            if (ll) {
                matched = true;
                resolver.resolve6(ll, (err, addresses) => {
                    if (addresses != undefined) handleResponse(last_type, response, last_hostname, addresses, cb); else return;
                });
                return;
            }

            if (sui) {
                matched = true;
                sucuri.getsucuriv6address(resolver, localStorageMemory, (err, addresses) => {
                    if (addresses != undefined) handleResponse(last_type, response, last_hostname, addresses, cb); else { cb(); return; }
                });
                return;
            }

            if (!net) net = netlify.check_for_netlify_hostname(last_hostname);
            if (net) {
                matched = true;
                netlify.getnetlifyv6address(resolver, localStorageMemory, (err, addresses) => {
                    if (addresses != undefined) handleResponse(last_type, response, last_hostname, addresses, cb); else { cb(); return; }
                });
                return;
            }

            if(bear) {
                matched = true;
                bearblog.getbearblogv6address(resolver, localStorageMemory, (err, addresses) => {
                    if (addresses != undefined) handleResponse(last_type, response, last_hostname, addresses, cb); else { cb(); return; }
                });
                return;
            }

            if (!shp) shp = cloudflare.check_for_shopify_hostname(last_hostname);
            if (shp) {
                matched = true;
                handleResponse(last_type, response, last_hostname, cloudflare.getshopifyv6address(), cb);
                return;
            }

            if (!wef) wef = cloudflare.check_for_webflow_hostname(last_hostname);
            if (wef) {
                matched = true;
                handleResponse(last_type, response, last_hostname, cloudflare.getwebflowv6address(), cb);
                return;
            }

            if (inx) {
                matched = true;
                //console.log('ptr', inwx_ptr);

                resolver.resolve6(inwx_ptr, (err, addresses) => {
                    if (addresses != undefined) handleResponse(last_type, response, last_hostname, addresses, cb); else return;
                });
                return;
            }

            if (!cfl && aggressive_v6) cfl = cloudflare.check_for_cloudflare_a(authority);
            if (!cfl) cfl = cloudflare.check_for_cloudflare_hostname(last_hostname);
            if (cfl) {
                matched = true;
                handleResponse(last_type, response, last_hostname, cloudflare.getcloudflarev6address(), cb);
                return;
            }

            if (!ali) ali = alicdn.check_for_alicdn_hostname(last_hostname);
            if (ali) {
                matched = true;

                handleResponse(last_type, response, last_hostname, alicdn.getalicdnv6address(resolver, localStorageMemory), cb);
                return;
            }

            if (!matched && aggressive_v6 && isApexDomain(question.name)) {
                resolver.resolve6("www."+question.name, (err, addresses) => {
                    //console.log('aaaa check', addresses);

                    if (addresses === undefined || addresses[0] === undefined) {
                        cb();
                        return;
                    } else {
                        matched = true;
                        handleResponse(last_type, response, last_hostname, addresses, cb);
                        return;
                    }
                });
            } else if (!matched && dns64) {
                resolver.resolve4(question.name, (err, addresses) => {
                    //console.log('a check', addresses);

                    if (addresses === undefined || addresses[0] === undefined) {
                        cb();
                        return;
                    } else {
                        matched = true;
                        var mapaddr = (ipaddr.parse('::ffff:' + addresses[0])).toString();
                        //console.log(mapaddr);

                        handleResponse(last_type, response, last_hostname, mapaddr.replace("::ffff:", dns64_range), cb);
                        return;
                    }
                });
            } else if (!matched) cb();

        }
        else if (question.type === 1) //A records
        {

            var ansaddr;
            var qhostname;

            msg.answer.forEach(a => {
                response.answer.push(a);
                //console.log('remote DNS response: ', a)
                ansaddr = a.address;
            });

            qhostname = question.name;

            if (fastly.check_for_fastly_ip(ansaddr) === true) {
                //console.log("added to fastly object");
                add_aaaa[qhostname] = "fastly";
                response.answer.forEach(function (item, index) {
                    response.answer[index].ttl = 0;
                });
                cb();
                return;
            }

            if (cloudfront.check_for_cloudfront_ip(ansaddr) === true) {
                //console.log("added to cloudfront object");
                add_aaaa[qhostname] = "cloudfront";
                response.answer.forEach(function (item, index) {
                    response.answer[index].ttl = 0;
                });
                cb();
                return;
            }

            if (sucuri.check_for_sucuri_ip(ansaddr) === true) {
                //console.log("added to sucuri object");
                add_aaaa[qhostname] = "sucuri";
                response.answer.forEach(function (item, index) {
                    response.answer[index].ttl = 0;
                });
                cb();
                return;
            }

            if (weebly.check_for_weebly_ip(ansaddr) === true) {
                //console.log("added to weebly object");
                add_aaaa[qhostname] = "weebly";
                response.answer.forEach(function (item, index) {
                    response.answer[index].ttl = 0;
                });
                cb();
                return;
            }

            if ((fastly.check_for_githubpages_ip(ansaddr) === true)) {
                //console.log("added to github.io object");
                add_aaaa[qhostname] = "githubio";

                response.answer.forEach(function (item, index) {
                    response.answer[index].ttl = 0;
                });
                cb();
                return;
            }

            if (netlify.check_for_netlify_ip(ansaddr) === true) {
                //console.log("added to netify ip");
                add_aaaa[qhostname] = "netlify";
                response.answer.forEach(function (item, index) {
                    response.answer[index].ttl = 0;
                });
                cb();
                return;
            }

            if(bearblog.check_for_bearblog_ip(ansaddr) === true) {
                //console.log("added to bearblog ip");
                add_aaaa[qhostname] = "bearblog";
                response.answer.forEach(function (item, index) {
                    response.answer[index].ttl = 0;
                });
                cb();
                return;
            }

            if (cloudflare.check_for_shopify_ip(ansaddr) === true) {
                //console.log("added to shopify object");
                add_aaaa[qhostname] = "shopify";
                response.answer.forEach(function (item, index) {
                    response.answer[index].ttl = 0;
                });
                cb();
                return;
            }

            if (cloudflare.check_for_webflow_ip(ansaddr) === true) {
                //console.log("added to webflow object");
                add_aaaa[qhostname] = "webflow";
                response.answer.forEach(function (item, index) {
                    response.answer[index].ttl = 0;
                });
                cb();
                return;
            }


            if(inwx.check_for_inwx_ip(ansaddr) === true) {
                //console.log("added to inwx ip");

                var ptrdoamin = ansaddr.split('.').reverse().join('.') + ".in-addr.arpa";

                resolver.resolvePtr(ptrdoamin, (err, addresses) => {
                    //console.log('ptr', addresses);
                    if (addresses != undefined) add_aaaa[qhostname] = "inwx|"+addresses; else return;
                });

                response.answer.forEach(function (item, index) {
                    response.answer[index].ttl = 0;
                });
                cb();
                return;
            }

            if (cloudflare.check_for_cloudflare_ip(ansaddr) === true) {
                //console.log("added to cloudflare object");
                add_aaaa[qhostname] = "cloudflare";
                response.answer.forEach(function (item, index) {
                    response.answer[index].ttl = 0;
                });
                cb();
                return;
            }

            if (wpvip.check_for_wordpressvip_ip(ansaddr) === true) {
                //console.log("added to wordpressvip ip");

                add_aaaa[qhostname] = wpvip.wpvipv4to6(ansaddr);
                response.answer.forEach(function (item, index) {
                    response.answer[index].ttl = 0;
                });
                cb();
                return;
            }

            if (akamai.check_for_akamai_hostname(qhostname)) add_aaaa[qhostname] = "akamai";
            if (fastly.check_for_fastly_hostname(qhostname)) add_aaaa[qhostname] = "fastly";
            if (weebly.check_for_weebly_hostname(qhostname)) add_aaaa[qhostname] = "weebly";
            if (netlify.check_for_netlify_hostname(qhostname)) add_aaaa[qhostname] = "netlify";
            if (cloudfront.check_for_cloudfront_hostname(qhostname)) add_aaaa[qhostname] = "cloudfront";
            if (bunnycdn.check_for_bunnycdn_hostname(qhostname)) add_aaaa[qhostname] = "bunnycdn";
            if (blazingcdn.check_for_blazingcdn_hostname(qhostname)) add_aaaa[qhostname] = "blazingcdn";
            if (gcorecdn.check_for_gcorecdn_hostname(qhostname)) add_aaaa[qhostname] = "gcorecdn";
            if (alicdn.check_for_alicdn_hostname(qhostname)) add_aaaa[qhostname] = "alicdn";

            cb();
        } else {
            // when we get answers, append them to the response
            msg.answer.forEach(a => {
                    response.answer.push(a);
                    //console.log('remote DNS response: ', a)
            });
            //console.log(response);

            request.on('end', cb);
        }
    });

    if (question.type === 1 && (remove_v4_if_v6_exist)) //A records
    {
        resolver_own.resolve6(question.name, (err, addresses) => {
            //console.log('aaaa check', addresses);
            //console.log('64 check', ipRangeCheck(addresses[0], dns64_range+"/96"));

            if (addresses === undefined || addresses[0] === undefined || ipRangeCheck(addresses[0], dns64_range+"/96")) {
                request.send();
            } else {
                //AAAA exist remove A
                response.header.rcode = 0;
                /*response.answer = [{
                            name: question.name,
                            type: 1,
                            class: 1,
                            ttl: 300,
                            address: '127.0.100.100'
                        }];*/
                cb();
            }
        });
    } else request.send();

}

function handleResponse(last_type, response, hostname, ipv6address, cb) {
    if ((last_type === 5) && (ipv6address)) { //cname

        //for each ipv6 genrate answer
        if (Array.isArray(ipv6address)) {
            ipv6address.forEach(ipv6 => {
                var aaaaresponse = generate_aaaa(hostname, ipv6);
                response.answer.push(aaaaresponse);
            });
        }
        //console.log('remote DNS response: ', aaaaresponse);
        cb();
    }
}

server6.on('request', handleRequest);

function generate_aaaa(hostname, ipv6) {
    if (!ipv6) return false;
    var newaaaa = {
        name: hostname,
        type: 28,
        class: 1,
        ttl: 300,
        address: ipv6
    };
    //console.log(newaaaa);
    return newaaaa;
}

