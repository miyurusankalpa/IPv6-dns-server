'use strict';

const config = require('./config.json');

//use a EDNS enabled DNS resolver for best results
var dns_resolver = config.dns_resolver;

let dns = require('native-dns');
let async = require('async');
let localStorageMemory = require('localstorage-memory');
let ipRangeCheck = require("ip-range-check");

const net = require('net');

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
var blazingcdn = require('./providers/blazingcdn');
var gcorecdn = require('./providers/gcorecdn');
var azurewebsites = require('./providers/azurewebsites')
var awsglobalaccelerator = require('./providers/awsglobalaccelerator');
var cachefly = require('./providers/cachefly');
var oracleobjectstorage = require('./providers/oracleobjectstorage');
var awsv6 = require('./providers/awsv6');

var ptrcheck = require('./ptrcheck');

const {
    Resolver
} = require('dns');

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

var no_aaaa = new Set(config.no_aaaa);
var add_aaaa = config.add_aaaa;

var aggressive_v6 = config.aggressive_v6;
var v6_only = config.v6_only;
var remove_v4_if_v6_exist = config.remove_v4_if_v6_exist;
var dns64 = config.dns64;
var dns64_only = config.dns64_only;

if (dns64_only) dns64 = true; //dns64_only implies dns64

var dns64_range = config.dns64_range; // "/96 CIDR assumed by default"

add_aaaa["scholar.google.com"] = "scholar.googleusercontent.com"; //Thanks @Mynacol https://codeberg.org/IPv6-Monostack/delegacy-rpz/pulls/53
add_aaaa["cdn.akamai.steamstatic.com"] = "a248.dsce.akamai.net";
add_aaaa["avherald.com"] = "2a02:8384:9:6::";

no_aaaa.add("ipv4.icanhazip.com"); //add this to no list, since it can mess with ipvfoo NAT detection

if (aggressive_v6) {
    add_aaaa["store.steampowered.com"] = "2a02:26f0:fe00:3bd::2db2";
    add_aaaa["store.steampowered.com"] = "2a02:26f0:fe00:3bd::2db2";
    add_aaaa["api.steampowered.com"] = "2a02:26f0:fe00:3bd::2db2";
    add_aaaa["underlords.com"] = "2a02:26f0:fe00:3bd::2db2";
    add_aaaa["x.com"] = "2a04:4e42::658";
    add_aaaa["api.x.com"] = "2a04:4e42::658";
    add_aaaa["android.clients.google.com"] = "2404:6800:4003:c01::65"; //todo: find a domain that resolves to this
}

//fix broken domains in non aggesive mode
if (!aggressive_v6) {
    no_aaaa.add("i.imgur.com");
}

function isBlockedDomain(name) {
    if (name === "www.jbl.com") return true;
    if (/^[a-z]{2}\.jbl\.com$/.test(name)) return true; //*.jbl.com subdomains: for #15
    if (/^[a-z]\.x\.com$/.test(name)) return true;
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

// ---- Resolution helpers (reduce provider boilerplate) ----

function resolve6AndRespond(ctx, rewrittenHostname) {
    ctx.matched = true;
    resolver.resolve6(rewrittenHostname, (err, addresses) => {
        if (addresses) handleResponse(ctx.last_type, ctx.response, ctx.last_hostname, addresses, ctx.cb);
        else ctx.cb();
    });
    return true;
}

function resolve4AndMapV6(ctx, mapFn) {
    ctx.matched = true;
    resolver.resolve4(ctx.last_hostname, async (err, v4addresses) => {
        if (err || !v4addresses) { ctx.cb(); return; }
        var v6 = mapFn === 'fastly' ? await fastly.fastlyv4tov6(v4addresses, resolver, localStorageMemory)
               : mapFn === 'msedge' ? msedge.msev4tov6(v4addresses, ctx.authorityname)
               : null;
        if (v6) handleResponse(ctx.last_type, ctx.response, ctx.last_hostname, v6, ctx.cb);
        else ctx.cb();
    });
    return true;
}

function asyncDNSAndRespond(ctx, dnsFn) {
    ctx.matched = true;
    dnsFn(resolver, localStorageMemory, (err, addresses) => {
        if (addresses) handleResponse(ctx.last_type, ctx.response, ctx.last_hostname, addresses, ctx.cb);
        else ctx.cb();
    });
    return true;
}

function staticV6AndRespond(ctx, ipv6) {
    ctx.matched = true;
    handleResponse(ctx.last_type, ctx.response, ctx.last_hostname, ipv6, ctx.cb);
    return true;
}

// ---- AAAA Provider Registry ----
// Each entry: { name, detect(ctx) → rewritten|true|false, resolve(ctx, result, cb) }
// detect returns: rewritten hostname string, true (flag-only), or false
// The loop stops at first match — no fall-through possible.

const AAAA_PROVIDERS = [
    // 1. Akamai — hostname rewrite → resolve6
    { name: 'akamai',
      detect: (ctx) => ctx.detected.akamai || akamai.check_for_akamai_hostname(ctx.last_hostname),
      resolve: (ctx, r, cb) => { ctx.matched = true; resolver.resolve6(r, (e, a) => a ? cb(a) : ctx.cb()); } },

    // 2. Azure Websites — matched_hostname → resolve6
    { name: 'azurewebsites',
      detect: (ctx) => ctx.detected.azurewebsites || azurewebsites.check_for_azureweb_hostname(ctx.matched_hostname),
      resolve: (ctx, r, cb) => { ctx.matched = true; resolver.resolve6(r, (e, a) => a ? cb(a) : ctx.cb()); } },

    // 3. AWS S3 — dual hostname check (question.name then last_hostname) → resolve6
    { name: 'awss3',
      detect: (ctx) => ctx.detected.awss3 || awss3.check_for_s3_hostname(ctx.question.name) || (aggressive_v6 && awss3.check_for_s3_hostname(ctx.last_hostname)),
      resolve: (ctx, r, cb) => { ctx.matched = true; resolver.resolve6(r, (e, a) => a ? cb(a) : ctx.cb()); } },

    // 4. Oracle Object Storage — dual hostname check → resolve6
    { name: 'oracleobjectstorage',
      detect: (ctx) => ctx.detected.oracleobjectstorage || oracleobjectstorage.check_for_oracleobjectstorage_hostname(ctx.question.name) || (aggressive_v6 && oracleobjectstorage.check_for_oracleobjectstorage_hostname(ctx.last_hostname)),
      resolve: (ctx, r, cb) => { ctx.matched = true; resolver.resolve6(r, (e, a) => a ? cb(a) : ctx.cb()); } },

    // 5. Alibaba OSS — question.name hostname → resolve6
    { name: 'alibabaoss',
      detect: (ctx) => ctx.detected.alibabaoss || alibabaoss.check_for_oss_hostname(ctx.question.name),
      resolve: (ctx, r, cb) => { ctx.matched = true; resolver.resolve6(r, (e, a) => a ? cb(a) : ctx.cb()); } },

    // 6. GitHub Pages — flag-only → Fastly v4→v6 resolution
    { name: 'githubio',
      detect: (ctx) => ctx.detected.githubio,
      resolve: (ctx, _, cb) => resolve4AndMapV6(ctx, 'fastly') },

    // 7. Fastly — authority SOA → v4→v6
    { name: 'fastly',
      detect: (ctx) => ctx.detected.fastly || fastly.check_for_fastly_a(ctx.authority),
      resolve: (ctx, _, cb) => resolve4AndMapV6(ctx, 'fastly') },

    // 8. Fastly hostname fallback — hostname rewrite → resolve6
    { name: 'fastly_hostname',
      detect: (ctx) => { var r = fastly.check_for_fastly_hostname(ctx.last_hostname); if (r) return r; return false; },
      resolve: (ctx, r, cb) => { ctx.matched = true; resolver.resolve6(r, (e, a) => (a && !e) ? handleResponse(ctx.last_type, ctx.response, ctx.last_hostname, a, ctx.cb) : ctx.cb()); } },

    // 9. MS Edge — authority → v4→v6
    { name: 'msedge',
      detect: (ctx) => ctx.detected.msedge || msedge.check_for_microsoftedge_a(ctx.authorityname),
      resolve: (ctx, _, cb) => resolve4AndMapV6(ctx, 'msedge') },

    // 10. CloudFront — hostname → async DNS
    { name: 'cloudfront',
      detect: (ctx) => ctx.detected.cloudfront || cloudfront.check_for_cloudfront_hostname(ctx.last_hostname),
      resolve: (ctx, _, cb) => asyncDNSAndRespond(ctx, cloudfront.getcloudfrontv6address) },

    // 11. BunnyCDN — hostname → async DNS
    { name: 'bunnycdn',
      detect: (ctx) => ctx.detected.bunnycdn || bunnycdn.check_for_bunnycdn_hostname(ctx.last_hostname),
      resolve: (ctx, _, cb) => asyncDNSAndRespond(ctx, bunnycdn.getbunnycdnv6address) },

    // 12. BlazingCDN — hostname → async DNS
    { name: 'blazingcdn',
      detect: (ctx) => ctx.detected.blazingcdn || blazingcdn.check_for_blazingcdn_hostname(ctx.last_hostname),
      resolve: (ctx, _, cb) => asyncDNSAndRespond(ctx, blazingcdn.getblazingcdnv6address) },

    // 13. GcoreCDN — hostname → async DNS
    { name: 'gcorecdn',
      detect: (ctx) => ctx.detected.gcorecdn || gcorecdn.check_for_gcorecdn_hostname(ctx.last_hostname),
      resolve: (ctx, _, cb) => asyncDNSAndRespond(ctx, gcorecdn.getgcorecdnv6address) },

    // 14. CacheFly — hostname rewrite → resolve6
    { name: 'cachefly',
      detect: (ctx) => ctx.detected.cachefly || cachefly.check_for_cachefly_hostname(ctx.last_hostname),
      resolve: (ctx, r, cb) => { ctx.matched = true; resolver.resolve6(r, (e, a) => a ? cb(a) : ctx.cb()); } },

    // 15. CDN77 — authority + hostname → async DNS
    { name: 'cdn77',
      detect: (ctx) => ctx.detected.cdn77 || cdn77.check_for_cdn77_a(ctx.authority) || cdn77.check_for_cdn77_hostname(ctx.last_hostname),
      resolve: (ctx, _, cb) => asyncDNSAndRespond(ctx, cdn77.get_cdn77_v6address) },

    // 16. AWS Global Accelerator — hostname rewrite → resolve6
    { name: 'awsglobalaccelerator',
      detect: (ctx) => ctx.detected.awsglobalaccelerator || awsglobalaccelerator.check_for_awsglb_hostname(ctx.last_hostname),
      resolve: (ctx, r, cb) => { ctx.matched = true; resolver.resolve6(r, (e, a) => a ? cb(a) : ctx.cb()); } },

    // 17. Weebly — hostname → static v6
    { name: 'weebly',
      detect: (ctx) => ctx.detected.weebly || weebly.check_for_weebly_hostname(ctx.last_hostname),
      resolve: (ctx, _, cb) => staticV6AndRespond(ctx, weebly.getweeblyv6address()) },

    // 18. Edgecast/Windows — hostname rewrite → resolve6
    { name: 'edgecast_windows',
      detect: (ctx) => ctx.detected.edgecast_windows || edgecast_windows.check_for_v0cdn_hostname(ctx.last_hostname),
      resolve: (ctx, r, cb) => { ctx.matched = true; resolver.resolve6(r, (e, a) => a ? handleResponse(ctx.last_type, ctx.response, ctx.last_hostname, a, ctx.cb) : ctx.cb()); } },

    // 19. Limelight — hostname rewrite → resolve6
    { name: 'limelight',
      detect: (ctx) => ctx.detected.limelight || limelight.check_for_lln_hostname(ctx.last_hostname),
      resolve: (ctx, r, cb) => { ctx.matched = true; resolver.resolve6(r, (e, a) => a ? handleResponse(ctx.last_type, ctx.response, ctx.last_hostname, a, ctx.cb) : ctx.cb()); } },

    // 20. Sucuri — flag-only → async DNS
    { name: 'sucuri',
      detect: (ctx) => ctx.detected.sucuri,
      resolve: (ctx, _, cb) => asyncDNSAndRespond(ctx, sucuri.getsucuriv6address) },

    // 21. Netlify — hostname → async DNS
    { name: 'netlify',
      detect: (ctx) => ctx.detected.netlify || netlify.check_for_netlify_hostname(ctx.last_hostname),
      resolve: (ctx, _, cb) => asyncDNSAndRespond(ctx, netlify.getnetlifyv6address) },

    // 22. Bear Blog — flag-only → async DNS
    { name: 'bearblog',
      detect: (ctx) => ctx.detected.bearblog,
      resolve: (ctx, _, cb) => asyncDNSAndRespond(ctx, bearblog.getbearblogv6address) },

    // 23. Shopify — hostname → static v6
    { name: 'shopify',
      detect: (ctx) => ctx.detected.shopify || cloudflare.check_for_shopify_hostname(ctx.last_hostname),
      resolve: (ctx, _, cb) => staticV6AndRespond(ctx, cloudflare.getshopifyv6address()) },

    // 24. Webflow — hostname → static v6
    { name: 'webflow',
      detect: (ctx) => ctx.detected.webflow || cloudflare.check_for_webflow_hostname(ctx.last_hostname),
      resolve: (ctx, _, cb) => staticV6AndRespond(ctx, cloudflare.getwebflowv6address()) },

    // 25. PTR — flag-only → resolve6(ip2ptr)
    { name: 'ptr',
      detect: (ctx) => ctx.detected.ptr,
      resolve: (ctx, _, cb) => { ctx.matched = true; resolver.resolve6(ctx.ip2ptr, (e, a) => a ? handleResponse(ctx.last_type, ctx.response, ctx.last_hostname, a, ctx.cb) : ctx.cb()); } },

    // 26. Cloudflare — authority (aggressive) + hostname → static v6
    { name: 'cloudflare',
      detect: (ctx) => ctx.detected.cloudflare || (aggressive_v6 && cloudflare.check_for_cloudflare_a(ctx.authority)) || cloudflare.check_for_cloudflare_hostname(ctx.last_hostname),
      resolve: (ctx, _, cb) => staticV6AndRespond(ctx, cloudflare.getcloudflarev6address()) },

    // 27. Alibaba CDN — hostname → async DNS
    { name: 'alicdn',
      detect: (ctx) => ctx.detected.alicdn || alicdn.check_for_alicdn_hostname(ctx.last_hostname),
      resolve: (ctx, _, cb) => asyncDNSAndRespond(ctx, alicdn.getalicdnv6address) },

    // 28. AWS IPv6 (*.amazonaws.com → *.api.aws) — hostname rewrite → resolve6
    { name: 'awsv6',
      detect: (ctx) => ctx.detected.awsv6 || awsv6.check_for_awsv6_hostname(ctx.last_hostname),
      resolve: (ctx, r, cb) => { ctx.matched = true; resolver.resolve6(r, (e, a) => a ? handleResponse(ctx.last_type, ctx.response, ctx.last_hostname, a, ctx.cb) : ctx.cb()); } },
];

function processAAAAProviders(ctx) {
    for (var i = 0; i < AAAA_PROVIDERS.length; i++) {
        var p = AAAA_PROVIDERS[i];
        var result = p.detect(ctx);
        if (result) {
            ctx.matched = true;
            p.resolve(ctx, result, function (addresses) {
                if (addresses) handleResponse(ctx.last_type, ctx.response, ctx.last_hostname, addresses, ctx.cb);
                else ctx.cb();
            });
            return;
        }
    }
}

// ---- A Record IP Detection Registry ----
const A_IP_PROVIDERS = [
    { check: (ip) => fastly.check_for_fastly_ip(ip), tag: 'fastly' },
    { check: (ip) => cloudfront.check_for_cloudfront_ip(ip), tag: 'cloudfront' },
    { check: (ip) => sucuri.check_for_sucuri_ip(ip), tag: 'sucuri' },
    { check: (ip) => weebly.check_for_weebly_ip(ip), tag: 'weebly' },
    { check: (ip) => fastly.check_for_githubpages_ip(ip), tag: 'githubio' },
    { check: (ip) => netlify.check_for_netlify_ip(ip), tag: 'netlify' },
    { check: (ip) => bearblog.check_for_bearblog_ip(ip), tag: 'bearblog' },
    { check: (ip) => cloudflare.check_for_shopify_ip(ip), tag: 'shopify' },
    { check: (ip) => cloudflare.check_for_webflow_ip(ip), tag: 'webflow' },
    { check: (ip) => ptrcheck.check_for_ptr_ip(ip), tag: 'ptr', async: true },
    { check: (ip) => cloudflare.check_for_cloudflare_ip(ip), tag: 'cloudflare' },
    { check: (ip) => wpvip.check_for_wordpressvip_ip(ip), tag: (ip) => wpvip.wpvipv4to6(ip) },
    { check: (ip) => cachefly.check_for_cachefly_ip(ip), tag: (ip) => cachefly.cacheflyv4to6(ip) },
];

// ---- A Record Hostname Detection Registry ----
const A_HOSTNAME_PROVIDERS = [
    { check: (h) => akamai.check_for_akamai_hostname(h), tag: 'akamai' },
    { check: (h) => fastly.check_for_fastly_hostname(h), tag: 'fastly' },
    { check: (h) => weebly.check_for_weebly_hostname(h), tag: 'weebly' },
    { check: (h) => netlify.check_for_netlify_hostname(h), tag: 'netlify' },
    { check: (h) => cloudfront.check_for_cloudfront_hostname(h), tag: 'cloudfront' },
    { check: (h) => bunnycdn.check_for_bunnycdn_hostname(h), tag: 'bunnycdn' },
    { check: (h) => blazingcdn.check_for_blazingcdn_hostname(h), tag: 'blazingcdn' },
    { check: (h) => gcorecdn.check_for_gcorecdn_hostname(h), tag: 'gcorecdn' },
    { check: (h) => alicdn.check_for_alicdn_hostname(h), tag: 'alicdn' },
    { check: (h) => cachefly.check_for_cachefly_hostname(h), tag: 'cachefly' },
    { check: (h) => oracleobjectstorage.check_for_oracleobjectstorage_hostname(h), tag: 'oracleobjectstorage' },
    { check: (h) => awsv6.check_for_awsv6_hostname(h), tag: 'awsv6' },
];

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
                no_aaaa.add(question.name);
            }

            if (question.name.startsWith("_noaaaa.")) { //subdomain with _noaaa
                no_aaaa.add(question.name.substr(8)); //add it to list without noaaaa subdomain
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

        /*if (question.type === 1) //A records
        {
            if (v6_only) {
                response.header.rcode = 0;
                response.send();
                return;
            }
        }*/

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

            var normalizedQuestionName = question.name.replace(/\.$/, '');
            var getcdn = add_aaaa[question.name];
            if (!getcdn && normalizedQuestionName !== question.name) {
                getcdn = add_aaaa[normalizedQuestionName];
            }

            if (getcdn && net.isIPv6(getcdn)) {
                response.answer = [];
                handleResponse(5, response, question.name, getcdn, cb);
                return;
            }

            if (last_type === 28 && !dns64_only) { //skip if there are AAAA records (unless dns64_only)
                cb();
                return;
            }

            if (dns64_only && last_type === 28) {
                response.answer = []; //clear native AAAA, will synthesize via DNS64
            }

            if (no_aaaa.has(question.name)) { //handle no AAAA domain correctly
                matched = true;
                if(dns64){
                    resolveIPv4AndMap(resolver, question, dns64_range, last_type, response, last_hostname, cb);
                    return;
                } else {
                    cb();
                    return;
                }
            }

            //console.log(add_aaaa);

            var detected = {};
            var ip2ptr = null;

            if (getcdn) {
                var providers = getcdn.split("|");
                var provider_name = providers[0].trim();

                //console.log('custom', provider_name);
                switch (provider_name) {
                    case 'fastly':
                        detected.fastly = true;
                        break;
                    case 'akamai':
                        detected.akamai = akamai.check_for_akamai_hostname(providers[1]);
                        break;
                    case 's3':
                        detected.awss3 = true;
                        break;
                    case 'cloudflare':
                        detected.cloudflare = true;
                        break;
                    case 'cloudfront':
                        detected.cloudfront = true;
                        break;
                    case 'msedge':
                        detected.msedge = true;
                        break;
                    case 'githubio':
                        detected.githubio = true;
                        break;
                    case 'edgecast_windows':
                        detected.edgecast_windows = true;
                        break;
                    case 'bunnycdn':
                        detected.bunnycdn = true;
                        break;
                    case 'sucuri':
                        detected.sucuri = true;
                        break;
                    case 'weebly':
                        detected.weebly = true;
                        break;
                    case 'cdn77':
                        detected.cdn77 = true;
                        break;
                    case 'limelight':
                        detected.limelight = true;
                        break;
                    case 'oss':
                        detected.alibabaoss = true;
                        break;
                    case 'alicdn':
                        detected.alicdn = true;
                        break;
                    case 'msidentity':
                        msi = true;
                        break;
                    case 'shopify':
                        detected.shopify = true;
                        break;
                    case 'webflow':
                        detected.webflow = true;
                        break;
                    case 'netlify':
                        detected.netlify = true;
                        break;
                    case 'bearblog':
                        detected.bearblog = true;
                        break;
                    case 'blazingcdn':
                        detected.blazingcdn = true;
                        break;
                    case 'gcorecdn':
                        detected.gcorecdn = true;
                        break;
                    case 'azureweb':
                        detected.azurewebsites = true;
                        break;
                    case 'awsglb':
                        detected.awsglobalaccelerator = true;
                        break;
                    case 'oracleobjectstorage':
                        detected.oracleobjectstorage = oracleobjectstorage.check_for_oracleobjectstorage_hostname(question.name);
                        break;
                    case 'cachefly':
                        detected.cachefly = cachefly.check_for_cachefly_hostname(question.name);
                        break;
                    case 'ipptr':
                        detected.ptr = true;
                        ip2ptr = providers[1];
                        break;
                    default: {
                    if (net.isIPv6(provider_name)) {
                        matched = true;
                        handleResponse(5, response, question.name, provider_name, cb); // only ipv6 address
                        return;
                    }
                    }
                }
            }

            if (last_hostname == undefined) {
                last_hostname = question.name;
                last_type = 5;
            }

            if (msg.authority[0]) var authority = msg.authority[0].admin;
            else var authority = 'none';
            if (msg.authority[0]) var authorityname = msg.authority[0].name;
            else var authorityname = 'none';

            var ctx = {
                question: question,
                response: response,
                last_hostname: last_hostname,
                matched_hostname: matched_hostname,
                last_type: last_type,
                authority: authority,
                authorityname: authorityname,
                matched: matched,
                cb: cb,
                detected: detected,
                ip2ptr: ip2ptr,
            };

            processAAAAProviders(ctx);
            matched = ctx.matched;

            if (!matched && aggressive_v6 && isApexDomain(question.name)) {
                resolver.resolve6("www."+question.name, (err, addresses) => {
                    if (addresses === undefined || addresses[0] === undefined) {
                        if (dns64) {
                            resolveIPv4AndMap(resolver, question, dns64_range, last_type, response, last_hostname, cb);
                        } else {
                            cb();
                        }
                        return;
                    } else {
                        handleResponse(last_type, response, last_hostname, addresses, cb);
                    }
                });
            } else if (!matched && dns64) {
                resolveIPv4AndMap(resolver, question, dns64_range, last_type, response, last_hostname, cb);
            } else if (!matched) cb();

        }
        else if (question.type === 1) //A records
        {

            var ansaddr;
            var qhostname;

            msg.answer.forEach(a => {
                response.answer.push(a);
                ansaddr = a.address;
            });

            qhostname = question.name;

            // IP-based provider detection (data-driven)
            for (var i = 0; i < A_IP_PROVIDERS.length; i++) {
                var p = A_IP_PROVIDERS[i];
                if (p.check(ansaddr) === true) {
                    if (p.async) {
                        var ptrdomain = ansaddr.split('.').reverse().join('.') + ".in-addr.arpa";
                        resolver.resolvePtr(ptrdomain, (err, addresses) => {
                            if (addresses != undefined) add_aaaa[qhostname] = "ipptr|"+addresses;
                        });
                    } else {
                        add_aaaa[qhostname] = typeof p.tag === 'function' ? p.tag(ansaddr) : p.tag;
                    }
                    if (handleV6Only(v6_only, response)) return;
                    resetTTLAndCallback(response, cb);
                    return;
                }
            }

            // Hostname-based provider detection (data-driven, short-circuit on first match)
            for (var i = 0; i < A_HOSTNAME_PROVIDERS.length; i++) {
                var p = A_HOSTNAME_PROVIDERS[i];
                if (p.check(qhostname)) {
                    add_aaaa[qhostname] = p.tag;
                    break;
                }
            }

            if (handleV6Only(v6_only, response)) return;

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
    if (!ipv6address) { cb(); return; }

    //for each ipv6 generate answer
    if (Array.isArray(ipv6address)) {
        ipv6address = ipv6address.slice(0, 7); //limit to 7 addresses, since it looks like is crashes the server #42
        ipv6address.forEach(ipv6 => {
        var aaaaresponse = generate_aaaa(hostname, ipv6);
        if (aaaaresponse) response.answer.push(aaaaresponse);
        });
    } else {
        var aaaaresponse = generate_aaaa(hostname, ipv6address);
        if (aaaaresponse) response.answer.push(aaaaresponse);
    }

    cb();
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


function ipv4ToIPv6Hex(ipv6prefix='::ffff:',ipv4) {
    const parts = ipv4.split('.').map(Number);
    const hex1 = parts[0].toString(16).padStart(2, '0') + parts[1].toString(16).padStart(2, '0');
    const hex2 = parts[2].toString(16).padStart(2, '0') + parts[3].toString(16).padStart(2, '0');
    return `${ipv6prefix}${hex1}:${hex2}`;
}

// Helper function for repetitive tasks
function resetTTLAndCallback(response, cb) {
    response.answer.forEach(function (item, index) {
        response.answer[index].ttl = 0;
    });
    cb();
}

function resolveIPv4AndMap(resolver, question, dns64_range, last_type, response, last_hostname, cb) {
    resolver.resolve4(question.name, (err, addresses) => {
        if (addresses === undefined || addresses[0] === undefined) {
            cb();
            return;
        }

        // Map all IPv4 addresses to IPv6 using DNS64
        let mapaddr;
        if (Array.isArray(addresses)) {
            mapaddr = addresses.map(ipv4 => ipv4ToIPv6Hex(dns64_range, ipv4));
        } else {
            mapaddr = [ipv4ToIPv6Hex(dns64_range, addresses)];
        }

        handleResponse(last_type, response, last_hostname, mapaddr, cb);
    });
}

// Helper function to handle v6_only mode
function handleV6Only(v6_only, response) {
    if (v6_only) {
        response.answer = [];
        response.header.rcode = 0;
        response.send();
        return true;
    }
    return false;
}
