'use strict';

//use a EDNS enabled DNS resolver for best results
var dns_resolver = '2001:4860:4860::8888';
//var dns_resolver = '8.8.8.8';

let dns = require('native-dns');
let async = require('async');
var dnsSync = require('dns-sync');

const {
    Resolver
} = require('dns');

const resolver = new Resolver();
const resolver_own = new Resolver();

let server4 = dns.createServer({
    dgram_type: 'udp4'
});
let server6 = dns.createServer({
    dgram_type: 'udp6'
});

resolver.setServers([dns_resolver]);

resolver_own.setServers(['[::1]']);

server4.on('listening', () => console.log('server listening on', server4.address()));
server4.on('close', () => console.log('server closed', server4.address()));
server4.on('error', (err, buff, req, res) => console.error(err.stack));
server4.on('socketError', (err, socket) => console.error(err));

server6.on('listening', () => console.log('server listening on', server6.address()));
server6.on('close', () => console.log('server closed', server6.address()));
server6.on('error', (err, buff, req, res) => console.error(err.stack));
server6.on('socketError', (err, socket) => console.error(err));

server4.serve(53);
server6.serve(53);

let authority = {
    address: dns_resolver,
    port: 53,
    type: 'udp6'
};

var noaaaa = ["jekyllrb.com"];
var addaaaa = {
    'archive.is': "2001:41d0:1:8720::1",
    'news.ycombinator.com': "2606:4700::6810:686e",
    'meta.stackoverflow.com': "fastly"
};

function handleRequest(request, response) {
    var question = request.question[0];
    console.log('request from', request.address.address, 'for', question.name);
    console.log('questions', request.question);

    let f = []; // array of functions

    // proxy all questions
    // since proxying is asynchronous, store all callbacks
    request.question.forEach(question => {

        if (question.type === 28) //AAAA records
        {
            if (noaaaa.indexOf(question.name) !== -1) return; //return fake repose
        }

        f.push(cb => proxy(question, response, cb));
    });

    // do the proxying in parallel
    // when done, respond to the request by sending the response
    async.parallel(f, function() {
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
        console.log('Timeout in making request no forwarding', question.name);
    });

    // when we get answers, append them to the response
    request.on('message', (err, msg) => {

        if (question.type === 28) //AAAA records
        {
            var last_hostname;
            var last_type;
            var newaaaa;
            var matched = false;

            for (const a of msg.answer) {
                last_hostname = a.data;
                last_type = a.type;
                response.answer.push(a);
            }

            var getip = addaaaa[question.name];

            var fsta;
            var ak;
            var s3;
            var v0c;
            var cfl;
            var cfr;
            var mse;
            var gio;
            var hw;

            if (getip) {
                console.log('custom');

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

                    default: {
                        newaaaa = {
                            name: question.name,
                            type: 28,
                            class: 1,
                            ttl: 30,
                            address: getip
                        };
                        handleResponse(5, response, newaaaa, cb);
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
                if (topdcheck.length == 2) {
                    last_hostname = 'www.' + last_hostname;
                    /*var cnames = dnsSync.resolve(last_hostname, 'CNAME');
                    	if(cnames) {
                    		last_hostname = cnames[0];
                    	}*/
                }
            }

            console.log('lh', last_hostname);

            if (!ak) ak = check_for_akamai_hostname(last_hostname);
            if (ak) {
                matched = true;
                resolver.resolve6(ak, (err, addresses) => {
                    newaaaa = {
                        name: ak,
                        type: 28,
                        class: 1,
                        ttl: 30,
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
                    newaaaa = {
                        name: s3,
                        type: 28,
                        class: 1,
                        ttl: 30,
                        address: addresses[0]
                    };
                    handleResponse(last_type, response, newaaaa, cb);
                });
                return;
            }


            if (!hw) hw = check_for_highwinds_hostname(last_hostname);
            if (hw) {
                matched = true;
                newaaaa = {
                    name: last_hostname,
                    type: 28,
                    class: 1,
                    ttl: 30,
                    address: '2001:4de0:ac19::1:b:1a'
                };
                handleResponse(last_type, response, newaaaa, cb);
                return;
            }

            if (msg.authority[0]) var authority = msg.authority[0].admin;
            else var authority = 'none';
            if (msg.authority[0]) var authorityname = msg.authority[0].name;
            else var authorityname = 'none';

            if (!cfl) cfl = check_for_cloudflare_a(authority);
            if (cfl) {
                matched = true;
                newaaaa = {
                    name: last_hostname,
                    type: 28,
                    class: 1,
                    ttl: 30,
                    address: '2606:4700::6810:ffff'
                };
                handleResponse(last_type, response, newaaaa, cb);
                return;
            }

            if (!gio) gio = check_for_githubio_a(authorityname);
            if (gio) {
                matched = true;
                newaaaa = {
                    name: last_hostname,
                    type: 28,
                    class: 1,
                    ttl: 30,
                    address: '2a04:4e42::133'
                };
                handleResponse(last_type, response, newaaaa, cb);
                return;
            }

            if (!fsta) fsta = check_for_fastly_a(authority);
            if (!fsta) fsta = check_for_fastly_hostname(last_hostname);
            if (fsta) {
                matched = true;
                resolver.resolve4(last_hostname, (err, v4addresses) => {
                    console.log(v4addresses);
                    var fv6 = fastlyv4tov6(v4addresses);
                    console.log(fv6);
                    newaaaa = {
                        name: last_hostname,
                        type: 28,
                        class: 1,
                        ttl: 30,
                        address: fv6
                    };
                    handleResponse(last_type, response, newaaaa, cb);
                });
                return;
            }

            if (!mse) mse = check_for_microsoftedge_a(authorityname);
            if (mse) {
                matched = true;
                resolver.resolve4(last_hostname, (err, v4addresses) => {
                    console.log(v4addresses);
                    var fv6 = msev4tov6(v4addresses, authorityname);
                    console.log(fv6);

                    if (!fv6) {
                        cb();
                        return;
                    }

                    newaaaa = {
                        name: last_hostname,
                        type: 28,
                        class: 1,
                        ttl: 30,
                        address: fv6
                    };
                    handleResponse(last_type, response, newaaaa, cb);
                    return;
                });

            }

            if (!cfr) cfr = check_for_cloudfront_hostname(last_hostname);
            if (cfr) {
                matched = true;
                //Mozilla cloudfront domain
                var aaaa_cloudfrtont_domain = 'balrog-cloudfront.prod.mozaws.net';

                resolver.resolve6(aaaa_cloudfrtont_domain, (err, addresses) => {
                    newaaaa = {
                        name: last_hostname,
                        type: 28,
                        class: 1,
                        ttl: 30,
                        address: addresses[0]
                    };
                    handleResponse(last_type, response, newaaaa, cb);
                    return;
                });
            }

            if (!v0c) v0c = check_for_v0cdn_hostname(last_hostname);
            if (v0c) {
                matched = true;
                resolver.resolve6(v0c, (err, addresses) => {
                    newaaaa = {
                        name: last_hostname,
                        type: 28,
                        class: 1,
                        ttl: 30,
                        address: addresses[0]
                    };
                    handleResponse(last_type, response, newaaaa, cb);
                    return;
                });
            }

            if (!matched) cb();
        } else {

            //A record

            msg.answer.forEach(a => {
                response.answer.push(a);
                console.log('remote DNS response: ', a)
            });
            cb();

        }


        console.log('m', msg);
    });

    if (question.type === 1) //A records
    {
        resolver_own.resolve6(question.name, (err, addresses) => {
            console.log('aaaa check', addresses);
            if (addresses === undefined || addresses[0] === undefined) {
                request.send();
            } else {
                cb();
            }
        });
    } else request.send();

}

function handleResponse(last_type, response, aaaaresponse, cb) {
    console.log('lt', last_type);
    if ((last_type === 5) && (aaaaresponse)) { //cname
        response.answer.push(aaaaresponse);
        console.log('remote DNS response: ', aaaaresponse);
        cb();
    }
}

server4.on('request', handleRequest);
server6.on('request', handleRequest);

function check_for_akamai_hostname(hostname) {
    if (!hostname) return false;
    var sdomains = hostname.split(".");
    sdomains.reverse();
    var dp1 = sdomains.indexOf("net");
    var dp2 = sdomains.indexOf("akamaiedge");

    if (dp1 === 0 && dp2 == 1) {
        console.log("akamai matched");
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
        console.log("cloudfront matched");
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
        console.log("highwinds matched");
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
        console.log("v0cdn matched");
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

    if (dp1 === 0 && dp2 == 1) {
        console.log("amazon matched");

        if (dp5 === 2) { //matched  s3-1-w.amazonaws.com
            sdomains[2] = 'us-east-1';
            sdomains[3] = 'dualstack';
            sdomains[4] = 's3';
            console.log("s3 matched");
        } else if (dp3 === 3 || dp4 === 3) {
            sdomains[3] = 'dualstack';
            sdomains[4] = 's3';
            console.log("s3 matched");
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
        console.log("fastly matched");
        var fixedhostname = sdomains.reverse().join(".");
        return fixedhostname;
    } else return false;
}

function check_for_cloudflare_a(authority) {
    console.log('a', authority);
    if (!authority) return false;
    if (authority == 'dns.cloudflare.com') {
        console.log("cloudflare matched");
        return true;
    } else return false;
}

function check_for_fastly_a(authority) {
    console.log('a', authority);
    if (!authority) return false;
    if (authority == 'hostmaster.fastly.com') {
        console.log("fastly matched");
        return true;
    } else return false;
}

function check_for_githubio_a(authority) {
    console.log('a', authority);
    if (!authority) return false;
    if (authority == 'github.io') {
        console.log("githubio matched");
        return true;
    } else return false;
}

function check_for_microsoftedge_a(authority) {
    console.log('a', authority);
    if (!authority) return false;
    if (authority.match(/msedge.net/g) !== null) {
        console.log("microsoft edge matched");
        return true;
    } else return false;
}

function fastlyv4tov6(ipv4) {
    console.log('f', ipv4);
    if (!ipv4[0]) return false;

    var octets = ipv4[0].split(".");

    console.log('last octets', octets[3]);

    var fastly_range = '2a04:4e42::'; //anycasted range

    if (ipv4.length == 1) {
        return fastly_range + octets[3];
    } else {
        var v6hex = ((octets[2] % 64) * 256 + (octets[3] * 1)); //huge thanks @tambry for this expression
        return fastly_range + v6hex;
    }
}

function msev4tov6(ipv4, hostname) {
    console.log('f', ipv4);
    if (!ipv4[0]) return false;

    var octets = ipv4[0].split(".");
    var mseid = hostname.split("-");
    console.log('mseid', mseid[0]);

    console.log('last octets', octets[3]);

    //anycasted range
    if (mseid[0] == 'l') var mse_range = '2620:1ec:21::';
    if (mseid[0] == 'a') var mse_range = '2620:1ec:c11::';
    if (mseid[0] == 's') var mse_range = '2620:1ec:6::';
    if (mseid[0] == 'spo') var mse_range = '2620:1ec:8f8::';

    if (!mse_range) {
        console.log('unkown mseid');
        return;
    }

    if (ipv4.length == 1) {
        return mse_range + octets[3];
    }
}