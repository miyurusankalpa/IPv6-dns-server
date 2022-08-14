'use strict';

//use a EDNS enabled DNS resolver for best results
var dns_resolver = '2001:4860:4860::8888'; //Google
//var dns_resolver = '2606:4700:4700::1111'; //Cloudflare
//var dns_resolver = '2a02:6b8::feed:0ff'; //Yandedx
//var dns_resolver = '2001:678:ed0:f000::'; //ffmuc
//var dns_resolver = '8.8.8.8'; //Google

let dns = require('native-dns');
let async = require('async');
var localStorageMemory = require('localstorage-memory');

var akamai = require('./providers/akamai');
var fastly = require('./providers/fastly');
var awss3 = require('./providers/awss3');
var cloudflare = require('./providers/cloudflare');
var cloudfront = require('./providers/cloudfront');
var msedge = require('./providers/msedge');
var highwinds = require('./providers/highwinds');
var edgecast_windows = require('./providers/edgecast_windows');
var bunnycdn = require('./providers/bunnycdn');
var sucuri = require('./providers/sucuri');
var weebly = require('./providers/weebly');
var wpvip = require('./providers/wpvip');

const {
    Resolver
} = require('dns');

const resolver = new Resolver();
const resolver_own = new Resolver();

resolver.setServers([dns_resolver]);
resolver_own.setServers(['[::1]']);

let server6 = dns.createServer({
    dgram_type: 'udp6',
});

server6.on('listening', () => console.log('server listening on', server6.address()));
server6.on('close', () => console.log('server closed', server6.address()));
server6.on('error', (err, buff, req, res) => console.error(err.stack));
server6.on('socketError', (err, socket) => console.error(err));

server6.serve(53);

let authority = {
    address: dns_resolver,
    port: 53,
    type: 'udp6'
};

var no_aaaa = [];
var add_aaaa = {};

var aggressive_v6 = false;
var v6_only = false;
var remove_v4_if_v6_exist = false;

if (aggressive_v6) {
    var add_aaaa = {
        'news.ycombinator.com': "cloudflare",
        'www.bbc.com': "2a04:4e42::81",
        'cdn.statically.io': "bunnycdn",
        'twitter.com': "cloudfront",
        'api.twitter.com': "cloudfront",
        'mobile.twitter.com': "cloudfront"
    };
}

//cache fastly range
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
            if (no_aaaa.indexOf(question.name) !== -1) {
                response.header.rcode = 0;
                response.send();
                return;
            }

            var cachedaaaaresponse = JSON.parse(localStorageMemory.getItem(question.name));

            if (cachedaaaaresponse) {
                //console.log(question.name, 'cached');
                response.answer = cachedaaaaresponse;
                response.send();
                return;
            }
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
        timeout: 500
    });

    request.on('timeout', function () {
        //console.log('Timeout in making request no forwarding', question.name);
    });

    // when we get answers, append them to the response
    request.on('message', (err, msg) => {

        if (question.type === 28) //AAAA records
        {
            var last_hostname;
            var last_type;
            var matched = false;

            for (const a of msg.answer) {
                last_hostname = a.data;
                last_type = a.type;
                response.answer.push(a);
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
            var hw;
            var bun;
            var sui;
            var wb;

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
                    case 'highwinds':
                        hw = true;
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
                    default: {
                        handleResponse(5, response, generate_aaaa(question.name, provider_name), cb);
                        return;
                    }
                }
            }

            if (last_type === 28) {
                cb();
                return;
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
                    if (addresses != undefined) handleResponse(last_type, response, generate_aaaa(ak, addresses[0]), cb); else return;
                });
                return;
            }

            if (!s3) s3 = awss3.check_for_s3_hostname(question.name);
            if (s3) {
                matched = true;
                resolver.resolve6(s3, (err, addresses) => {
                    if (addresses != undefined) handleResponse(last_type, response, generate_aaaa(s3, addresses[0]), cb); else return;
                });
                return;
            }

            if (!hw) hw = highwinds.check_for_highwinds_hostname(last_hostname);
            if (hw) {
                matched = true;
                var hwv6address = highwinds.gethighwindv6address();
                handleResponse(last_type, response, generate_aaaa(last_hostname, hwv6address), cb);
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
                        cb();
                        return;
                    }

                    handleResponse(last_type, response, generate_aaaa(last_hostname, fv6), cb);
                });
                return;
            }

            if (!fsta) var fsta1 = fastly.check_for_fastly_hostname(last_hostname);
            if (fsta1 && fsta1[0] == "d") {
                //console.log(fsta1);
                matched = true; fsta = fsta1;
                resolver.resolve6(fsta1, (err, addresses) => {
                    if (addresses != undefined) handleResponse(last_type, response, generate_aaaa(fsta1, addresses[0]), cb); else return;
                });
                return;
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

                    handleResponse(last_type, response, generate_aaaa(last_hostname, mv6), cb);
                    return;
                });

            }

            if (!cfr) cfr = cloudfront.check_for_cloudfront_hostname(last_hostname);
            if (cfr) {
                matched = true;

                handleResponse(last_type, response, generate_aaaa(last_hostname, cloudfront.getcloudfrontv6address(resolver, localStorageMemory)), cb);
                return;
            }

            if (!bun) bun = bunnycdn.check_for_bunnycdn_hostname(last_hostname);
            if (bun) {
                matched = true;
                var bv6address = bunnycdn.getbunnycdnv6address(resolver, localStorageMemory);
                handleResponse(last_type, response, generate_aaaa(last_hostname, bv6address), cb);
                return;
            }

            if (!wb) wb = weebly.check_for_weebly_hostname(last_hostname);
            if (wb) {
                matched = true;
                var wbv6address = weebly.getweeblyv6address();
                handleResponse(last_type, response, generate_aaaa(last_hostname, wbv6address), cb);
                return;
            }

            if (!v0c) v0c = edgecast_windows.check_for_v0cdn_hostname(last_hostname);
            if (v0c) {
                matched = true;
                resolver.resolve6(v0c, (err, addresses) => {
                    handleResponse(last_type, response, generate_aaaa(last_hostname, addresses[0]), cb);
                    return;
                });
            }

            if (sui) {
                matched = true;
                var sv6address = sucuri.getsucuriv6address(resolver, localStorageMemory);
                handleResponse(last_type, response, generate_aaaa(last_hostname, sv6address), cb);
                return;
            }

            if (!cfl && aggressive_v6) cfl = cloudflare.check_for_cloudflare_a(authority);
            if (cfl) {
                matched = true;
                handleResponse(last_type, response, generate_aaaa(last_hostname, cloudflare.getcloudflarev6address()), cb);
                return;
            }

            if (!matched) cb();
        } else {

            if (question.type === 1) //A records
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
                    if ((fastly.check_for_stackexchange_ip(ansaddr)) && (!aggressive_v6)) {
                        no_aaaa.push(qhostname);
                        //console.log("added to stackexchange noipv6 object");
                    } else {
                        add_aaaa[qhostname] = "fastly";
                        //console.log("added to fastly object");
                    }

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

                if (fastly.check_for_fastly_hostname(qhostname)) add_aaaa[qhostname] = "fastly";
                if (weebly.check_for_weebly_hostname(qhostname)) add_aaaa[qhostname] = "weebly";
                if (cloudfront.check_for_cloudfront_hostname(qhostname)) add_aaaa[qhostname] = "cloudfront";
            }
            cb();
        }

        //console.log('m', msg);
    });

    if (question.type === 1 && (remove_v4_if_v6_exist)) //A records
    {
        resolver_own.resolve6(question.name, (err, addresses) => {
            //console.log('aaaa check', addresses);

            if (addresses === undefined || addresses[0] === undefined) {
                request.send();
            } else {
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

function handleResponse(last_type, response, aaaaresponse, cb) {
    //console.log('lt', last_type);
    //console.log('cachekey', response.question[0].name);
    if ((last_type === 5) && (aaaaresponse)) { //cname
        response.answer.push(aaaaresponse);
        localStorageMemory.setItem(response.question[0].name, JSON.stringify(response.answer));
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
