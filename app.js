'use strict';

//add fake doamin to test dns

//use a EDNS enabled DNS resolver for best results
//var dns_resolver = '2001:4860:4860::8888';
var dns_resolver = '2606:4700:4700::1111';
//var dns_resolver = '8.8.8.8';

let dns = require('native-dns');
let async = require('async');
var dnsSync = require('dns-sync');
var localStorageMemory = require('localstorage-memory');
var ipRangeCheck = require("ip-range-check");

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

var noaaaa = ["jekyllrb.com"];
var addaaaa = {
    'archive.is': "2001:41d0:1:8720::1",
    'registry.npmjs.org': "cloudflare",
    'cdn.jsdelivr.net': "cloudflare", //https://github.com/jsdelivr/jsdelivr/issues/18163
    'news.ycombinator.com': "cloudflare",
    'static.twitchcdn.net': "fastly",
    'www.bbc.com': "fastly",
    'android.clients.google.com': "2404:6800:4003:c04::8b",
};

//from http://d7uri8nf7uskq.cloudfront.net/tools/list-cloudfront-ips
var cloudfrontiplist = {
    "CLOUDFRONT_GLOBAL_IP_LIST": ["144.220.0.0/16", "52.124.128.0/17", "54.230.0.0/16", "54.239.128.0/18", "52.82.128.0/19", "99.84.0.0/16", "205.251.192.0/19", "54.239.192.0/19", "70.132.0.0/18", "13.32.0.0/15", "13.224.0.0/14", "13.35.0.0/16", "204.246.172.0/23", "204.246.164.0/22", "204.246.168.0/22", "71.152.0.0/17", "216.137.32.0/19", "205.251.249.0/24", "99.86.0.0/16", "52.46.0.0/18", "52.84.0.0/15", "130.176.0.0/16", "64.252.64.0/18", "204.246.174.0/23", "64.252.128.0/18", "205.251.254.0/24", "143.204.0.0/16", "205.251.252.0/23", "204.246.176.0/20", "13.249.0.0/16", "54.240.128.0/18", "205.251.250.0/23", "52.222.128.0/17", "54.182.0.0/16", "54.192.0.0/16"],
    "CLOUDFRONT_REGIONAL_EDGE_IP_LIST": ["13.124.199.0/24", "34.226.14.0/24", "52.15.127.128/26", "35.158.136.0/24", "52.57.254.0/24", "18.216.170.128/25", "13.54.63.128/26", "13.59.250.0/26", "13.210.67.128/26", "35.167.191.128/26", "52.47.139.0/24", "52.199.127.192/26", "52.212.248.0/26", "52.66.194.128/26", "13.113.203.0/24", "34.195.252.0/24", "35.162.63.192/26", "34.223.12.224/27", "52.56.127.0/25", "34.223.80.192/26", "13.228.69.0/24", "34.216.51.0/25", "54.233.255.128/26", "52.52.191.128/26", "52.78.247.128/26", "52.220.191.0/26", "34.232.163.208/29"]
};

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
            if (noaaaa.indexOf(question.name) !== -1) {
                response.header.rcode = 0;
                response.answer = [{
                    name: question.name,
                    type: 1,
                    class: 1,
                    ttl: 300,
                    address: '127.0.0.1'
                }];
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

        f.push(cb => proxy(question, response, cb));
    });

    // do the proxying in parallel
    // when done, respond to the request by sending the response
    async.parallel(f, function() {
        ////console.log('response', response);
        response.send();
    });
}

function proxy(question, response, cb) {
    console.log('proxying', JSON.stringify(question));

    var request = dns.Request({
        question: question, // forwarding the question
        server: authority, // this is the DNS server we are asking
        timeout: 500
    });

    request.on('timeout', function() {
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

            var getip = addaaaa[question.name];

            console.log(addaaaa);

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

            if (getip) {
                //console.log('custom');

                switch (getip) {
                    case 'fastly':
                        fsta = true;
                        break;
                    case 'akamai':
                        ak = true;
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
                    case 'gihubio':
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
                    default: {
                        handleResponse(5, response, generate_aaaa(question.name, getip), cb);
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
                var topdcheck = last_hostname.split(".");
            }

            //console.log('lh', last_hostname);

            if (!ak) ak = check_for_akamai_hostname(last_hostname);
            if (ak) {
                matched = true;
                resolver.resolve6(ak, (err, addresses) => {
                    newaaaa = {
                        name: ak,
                        type: 28,
                        class: 1,
                        ttl: 300,
                        address: addresses[0]
                    };
                    handleResponse(last_type, response, newaaaa, cb);
                });
                return;
            }


            if (!s3) s3 = check_for_s3_hostname(last_hostname);
            if (s3) {
                matched = true;
                resolver.resolve6(s3, (err, addresses) => {
                    handleResponse(last_type, response, generate_aaaa(s3, addresses[0]), cb);
                });
                return;
            }


            if (!hw) hw = check_for_highwinds_hostname(last_hostname);
            if (hw) {
                matched = true;
                handleResponse(last_type, response, generate_aaaa(last_hostname, '2001:4de0:ac19::1:b:1a'), cb);
                return;
            }

            if (msg.authority[0]) var authority = msg.authority[0].admin;
            else var authority = 'none';
            if (msg.authority[0]) var authorityname = msg.authority[0].name;
            else var authorityname = 'none';

            if (!cfl) cfl = check_for_cloudflare_a(authority);
            if (cfl) {
                matched = true;
                handleResponse(last_type, response, generate_aaaa(last_hostname, '2606:4700::6810:ffff'), cb);
                return;
            }

            if (!gio) gio = check_for_githubio_a(authorityname);
            if (gio) {
                matched = true;
                handleResponse(last_type, response, generate_aaaa(last_hostname, '2a04:4e42::133'), cb);
                return;
            }

            if (!fsta) fsta = check_for_fastly_a(authority);
            if (!fsta) fsta = check_for_fastly_hostname(last_hostname);
            if (fsta) {
                matched = true;
                resolver.resolve4(last_hostname, (err, v4addresses) => {
                    //console.log(v4addresses);
                    var fv6 = fastlyv4tov6(v4addresses);
                    //console.log(fv6);
					
					if (!fv6) {
                        cb();
                        return;
                    }
					
                    handleResponse(last_type, response, generate_aaaa(last_hostname, fv6), cb);
                });
                return;
            }

            if (!mse) mse = check_for_microsoftedge_a(authorityname);
            if (mse) {
                matched = true;
                resolver.resolve4(last_hostname, (err, v4addresses) => {
                    //console.log(v4addresses);
                    var mv6 = msev4tov6(v4addresses, authorityname);
                    //console.log(mv6);

                    if (!mv6) {
                        cb();
                        return;
                    }

                    handleResponse(last_type, response, generate_aaaa(last_hostname, mv6), cb);
                    return;
                });

            }

            if (!cfr) cfr = check_for_cloudfront_hostname(last_hostname);
            if (cfr) {
                matched = true;
                //Mozilla cloudfront domain
                var aaaa_cloudfrtont_domain = 'balrog-cloudfront.prod.mozaws.net';

                resolver.resolve6(aaaa_cloudfrtont_domain, (err, addresses) => {
                    handleResponse(last_type, response, generate_aaaa(last_hostname, addresses[0]), cb);
                    return;
                });
            }

            if (!bun) bun = check_for_bunnycdn_hostname(last_hostname);
            if (bun) {
                matched = true;
                //crtlblog ipv6 enabled domain
                var aaaa_bunny_domain = 'ctrl.b-cdn.net';

                resolver.resolve6(aaaa_bunny_domain, (err, addresses) => {
                    handleResponse(last_type, response, generate_aaaa(last_hostname, addresses[0]), cb);
                    return;
                });
            }

            if (!v0c) v0c = check_for_v0cdn_hostname(last_hostname);
            if (v0c) {
                matched = true;
                resolver.resolve6(v0c, (err, addresses) => {
                    handleResponse(last_type, response, generate_aaaa(last_hostname, addresses[0]), cb);
                    return;
                });
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

                if (check_for_fastly_ip(ansaddr) === true) {
                    //console.log("added to fastly object");
                    if(!check_for_fastly_hostname(qhostname)) addaaaa[qhostname] = "fastly";
                    response.answer.forEach(function(item, index) {
                        response.answer[index].ttl = 2;
                    });
                    cb();
                    return;
                }

                if (check_for_cfr_ip(ansaddr) === true) {
                    //console.log("added to cloudfront object");
                    if(!check_for_cloudfront_hostname(qhostname)) addaaaa[qhostname] = "cloudfront";
                    response.answer.forEach(function(item, index) {
                        response.answer[index].ttl = 2;
                    });
                    cb();
                    return;
                }
            }

            cb();

        }


        //console.log('m', msg);
    });

    /* if (question.type === 1) //A records
    {
        resolver_own.resolve6(question.name, (err, addresses) => {
            //console.log('aaaa check', addresses);

            if (addresses === undefined || addresses[0] === undefined) {
                request.send();
            } else {
				response.header.rcode = 0;
				response.answer = [{
                            name: question.name,
                            type: 1,
                            class: 1,
                            ttl: 300,
                            address: '127.0.0.1'
                        }];
                cb();
            }
        });
		
    } else */
    request.send();

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

function check_for_akamai_hostname(hostname) {
    if (!hostname) return false;
    var sdomains = hostname.split(".");
    sdomains.reverse();
    var dp1 = sdomains.indexOf("net");
    var dp2 = sdomains.indexOf("akamaiedge");
    var dp3 = sdomains.indexOf("akamai");

    if (dp1 === 0 && (dp2 == 1 || dp3 == 1)) {
        //console.log("akamai matched");
        sdomains[2] = 'dsc' + sdomains[2];
        var fixedhostname = sdomains.reverse().join(".");
        return fixedhostname;
    } else return false;
}

function check_for_cloudfront_hostname(hostname) {
    if (!hostname) return false;
    var sdomains = hostname.split(".");
    sdomains.reverse();
    var dp1 = sdomains.indexOf("net");
    var dp2 = sdomains.indexOf("cloudfront");

    if (dp1 === 0 && dp2 == 1) {
        //console.log("cloudfront matched");
        var fixedhostname = sdomains.reverse().join(".");
        return fixedhostname;
    } else return false;
}

function check_for_bunnycdn_hostname(hostname) {
    if (!hostname) return false;
    var sdomains = hostname.split(".");
    sdomains.reverse();
    var dp1 = sdomains.indexOf("net");
    var dp2 = sdomains.indexOf("b-cdn");

    if (dp1 === 0 && dp2 == 1) {
        //console.log("bunnycdn matched");
        var fixedhostname = sdomains.reverse().join(".");
        return fixedhostname;
    } else return false;
}


function check_for_highwinds_hostname(hostname) {
    if (!hostname) return false;
    var sdomains = hostname.split(".");
    sdomains.reverse();
    var dp1 = sdomains.indexOf("net");
    var dp2 = sdomains.indexOf("hwcdn");

    if (dp1 === 0 && dp2 == 1) {
        //console.log("highwinds matched");
        var fixedhostname = sdomains.reverse().join(".");
        return fixedhostname;
    } else return false;
}

function check_for_v0cdn_hostname(hostname) {
    if (!hostname) return false;
    var sdomains = hostname.split(".");
    sdomains.reverse();
    var dp1 = sdomains.indexOf("net");
    var dp2 = sdomains.indexOf("v0cdn");

    if (dp1 === 0 && dp2 == 1) {
        //console.log("v0cdn matched");
        sdomains[3] = 'cs21';
        var fixedhostname = sdomains.reverse().join(".");
        return fixedhostname;
    } else return false;
}

function check_for_s3_hostname(hostname) {
    if (!hostname) return false;
    var sdomains = hostname.split(".");
    sdomains.reverse();
    var dp1 = sdomains.indexOf("com");
    var dp2 = sdomains.indexOf("amazonaws");
    var dp3 = sdomains.indexOf("s3");
    var dp4 = sdomains.indexOf("s3-control");
    var dp5 = sdomains.indexOf("s3-1-w");
    var dp6 = sdomains.indexOf("s3-1");

    if (dp1 === 0 && dp2 == 1) {
        //console.log("amazon matched");

        if (dp5 === 2 || dp6 === 2) { //matched  s3-1-w.amazonaws.com or s3-1.amazonaws.com
            sdomains[2] = 'us-east-1';
            sdomains[3] = 'dualstack';
            sdomains[4] = 's3';
            //console.log("s3 matched");
        } else if (dp3 === 3 || dp4 === 3) {
            sdomains[3] = 'dualstack';
            sdomains[4] = 's3';
            //console.log("s3 matched");
        } else return false;

        var fixedhostname = sdomains.reverse().join(".");
        return fixedhostname;

    } else return false;
}

function check_for_fastly_hostname(hostname) {
    if (!hostname) return false;
    var sdomains = hostname.split(".");
    sdomains.reverse();
    var dp1 = sdomains.indexOf("net");
    var dp2 = sdomains.indexOf("fastly");
    var dp3 = sdomains.indexOf("fastlylb");

    if (dp1 === 0 && (dp2 == 1 || dp3 == 1)) {
        //console.log("fastly matched");
        var fixedhostname = sdomains.reverse().join(".");
        return fixedhostname;
    } else return false;
}

function check_for_cloudflare_a(authority) {
    //console.log('a', authority);
    if (!authority) return false;
    if (authority == 'dns.cloudflare.com') {
        //console.log("cloudflare matched");
        return true;
    } else return false;
}

function check_for_fastly_a(authority) {
    //console.log('a', authority);
    if (!authority) return false;
    if (authority == 'hostmaster.fastly.com') {
        //console.log("fastly matched");
        return true;
    } else return false;
}

function check_for_githubio_a(authority) {
    //console.log('a', authority);
    if (!authority) return false;
    if (authority == 'github.io') {
        //console.log("githubio matched");
        return true;
    } else return false;
}

function check_for_microsoftedge_a(authority) {
    //console.log('a', authority);
    if (!authority) return false;
    if (authority.match(/msedge.net/g) !== null) {
        //console.log("microsoft edge matched");
        return true;
    } else return false;
}

function fastlyv4tov6(ipv4) {
    //console.log('f', ipv4);
    if (!ipv4[0]) return false;

    var octets = ipv4[0].split(".");

    //console.log('last octets', octets[3]);

    var fastly_range = '2a04:4e42::'; //anycasted range
    var v6hex;

    if (ipv4.length == 1) {
        v6hex = ((octets[2] % 4) * 256 + (octets[3] * 1));
    } else {
        v6hex = ((octets[2] % 64) * 256 + (octets[3] * 1)); //huge thanks @tambry for this expression
    }
    return fastly_range + v6hex;
}

function msev4tov6(ipv4, hostname) {
    //console.log('f', ipv4);
    if (!ipv4[0]) return false;

    var octets = ipv4[0].split(".");
    var mseid = hostname.split("-");
    //console.log('mseid', mseid[0]);

    //console.log('last octets', octets[3]);

    //anycasted range
    if (mseid[0] == 'l') var mse_range = '2620:1ec:21::';
    if (mseid[0] == 'a') var mse_range = '2620:1ec:c11::';
    if (mseid[0] == 's') var mse_range = '2620:1ec:6::';
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
}

function check_for_fastly_ip(ipv4) {
    //console.log('fastly ip check', ipv4);
    if (!ipv4) return false;

    return ipRangeCheck(ipv4, "151.101.0.0/16");
}

function check_for_cfr_ip(ipv4) {
    console.log('cloudfront ip check', ipv4);
    if (!ipv4) return false;

    //console.log('cloudfront global check', ipRangeCheck(ipv4, cloudfrontiplist.CLOUDFRONT_GLOBAL_IP_LIST));
    //console.log('cloudfront reg check', ipRangeCheck(ipv4, cloudfrontiplist.CLOUDFRONT_REGIONAL_EDGE_IP_LIST));

    if (ipRangeCheck(ipv4, cloudfrontiplist.CLOUDFRONT_GLOBAL_IP_LIST)) return true;
    else return ipRangeCheck(ipv4, cloudfrontiplist.CLOUDFRONT_REGIONAL_EDGE_IP_LIST);
}

function generate_aaaa(hostname, ipv6) {
    if (!ipv6) return false;
	var newaaaa = {       
			name: hostname,
			type: 28,
			class: 1,
			ttl: 300,
			address: ipv6
	};
	return newaaaa;
}