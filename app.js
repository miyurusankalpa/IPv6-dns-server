'use strict';

//use a EDNS enabled DNS resolver for best results
//var dns_resolver = '2001:4860:4860::8888';
var dns_resolver = '8.8.8.8';

let dns = require('native-dns');
let async = require('async');
var dnsSync = require('dns-sync');
//const maxmind = require('maxmind');

const { Resolver } = require('dns');
const resolver = new Resolver();
//const resolver_own = new Resolver();

let server4 = dns.createServer({ dgram_type: 'udp4' });
let server6 = dns.createServer({ dgram_type: 'udp6' });

resolver.setServers([dns_resolver]);

//resolver_own.setServers('127.0.0.1');

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

let authority = { address: dns_resolver, port: 53, type: 'udp6' };

function handleRequest(request, response) {
	var question = request.question[0];
	console.log('request from', request.address.address, 'for', question.name);
	console.log('questions', request.question);

  let f = []; // array of functions
  
		// proxy all questions
		// since proxying is asynchronous, store all callbacks
		request.question.forEach(question => {
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
		server: authority,  // this is the DNS server we are asking
		timeout: 500
	});

	request.on('timeout', function () {
		console.log('Timeout in making request no forwarding', question.name);
	});
	
	// when we get answers, append them to the response
	request.on('message', (err, msg) => {
		
			
			
			if(question.type===28) //AAAA recore
				{
				var last_hostname; var last_type; var newaaaa; var matched = false;
				for (const a of msg.answer) {
						last_hostname = a.data; last_type = a.type;
						response.answer.push(a);
					}
					
					if(last_type===28) {
						cb();
						return;
					}
					
				if(last_hostname==undefined) {
					last_hostname = question.name;
					last_type=5;
					var topdcheck = last_hostname.split(".");
					if(topdcheck.length==2) {
						last_hostname = 'www.'+last_hostname;
						var cnames = dnsSync.resolve(last_hostname, 'CNAME');
							if(cnames) {
								last_hostname = cnames[0];
							}
					}
				}
					
				console.log('lh',last_hostname);
				
				var ak = check_for_akamai_hostname(last_hostname);
					if(ak) {
						matched = true;
							resolver.resolve6(ak, (err, addresses) => {
									newaaaa = { name: ak, type: 28,  class: 1,  ttl: 30,  address: addresses[0] };
									handleResponse(last_type, response, newaaaa , cb);
							});
						}
						
				
				var s3 = check_for_s3_hostname(last_hostname);
				if(s3) {
					matched = true;
							resolver.resolve6(s3, (err, addresses) => {
									newaaaa = { name: s3, type: 28,  class: 1,  ttl: 30,  address: addresses[0] };
									handleResponse(last_type, response, newaaaa , cb);
							});
				}
				
				
				var hw = check_for_highwinds_hostname(last_hostname);
				if(hw) {
					matched = true;
					newaaaa = { name: last_hostname, type: 28,  class: 1,  ttl: 30,  address: '2001:4de0:ac19::1:b:1a' };
					handleResponse(last_type, response, newaaaa , cb);
				}
				
				if(msg.authority[0]) var authority=msg.authority[0].admin; else var authority = 'none';
				
				var cfl = check_for_cloudflare_a(authority);
				if(cfl){
					matched = true;
					newaaaa = { name: last_hostname, type: 28,  class: 1,  ttl: 30,  address: '2606:4700::6810:ffff' };
					handleResponse(last_type, response, newaaaa , cb);
				}
				
				var fsta = check_for_fastly_a(authority);
				if(!fsta) fsta = check_for_fastly_hostname(last_hostname);
				if(fsta){
					matched = true;
							resolver.resolve4(last_hostname, (err, v4addresses) => {
									console.log(v4addresses);
									var fv6 = fastlyv4tov6(v4addresses);
									console.log(fv6);
									newaaaa = { name: last_hostname, type: 28,  class: 1,  ttl: 30,  address: fv6 };
									handleResponse(last_type, response, newaaaa , cb);
							});
							
				}
				//var cfr = check_for_cloudfront_a(authority);
				var cfr = check_for_cloudfront_hostname(last_hostname);
				if(cfr){
					matched = true;
					//Mozilla cloudfront domain
					var aaaa_cloudfrtont_domain = 'balrog-cloudfront.prod.mozaws.net';
					
							resolver.resolve6(aaaa_cloudfrtont_domain, (err, addresses) => {
									newaaaa = { name: last_hostname, type: 28,  class: 1,  ttl: 30,  address: addresses[0] };
									handleResponse(last_type, response, newaaaa , cb);
							});
				}
				
				if(!matched) cb();
			} else {
				
				//aaaa check
				
				resolver.resolve6(question.name, (err, addresses) => {
					console.log('aaaa check' ,addresses);
					if(addresses!==[])
					{
						msg.answer.forEach(a => {
							response.answer.push(a);
							console.log('remote DNS response: ', a)	
						});
					} else {
						msg.header.rcode=3;
						msg.answer=[];
					}
						cb();
				});
			}
			
		
		console.log('m', msg);
	});

	//request.on('end', cb);
	request.send();
}
function handleResponse(last_type, response, aaaaresponse, cb) {
	console.log('lt', last_type);
	if((last_type===5) && (aaaaresponse)){ //cname
				response.answer.push(aaaaresponse);
				console.log('remote DNS response: ', aaaaresponse);
				cb();
	}
}


server4.on('request', handleRequest);
server6.on('request', handleRequest);

function check_for_akamai_hostname(hostname){
	if(!hostname) return false;
	 var sdomains = hostname.split(".");
		 sdomains.reverse();
		var dp1 = sdomains.indexOf("net");
		var dp2 = sdomains.indexOf("akamaiedge");
		
	 if(dp1===0 && dp2==1) {
		 		 console.log("akamai matched");
			sdomains[2] = 'dsc'+ sdomains[2];
		 var fixedhostname = sdomains.reverse().join(".");
	return fixedhostname;
	 } else return false;
}
function check_for_cloudfront_hostname(hostname){
	if(!hostname) return false;
	 var sdomains = hostname.split(".");
		 sdomains.reverse();
		var dp1 = sdomains.indexOf("net");
		var dp2 = sdomains.indexOf("cloudfront");
		
	 if(dp1===0 && dp2==1) {
		 		 console.log("cloudfront matched");
		 var fixedhostname = sdomains.reverse().join(".");
	return fixedhostname;
	 } else return false;
}
function check_for_highwinds_hostname(hostname){
	if(!hostname) return false;
	 var sdomains = hostname.split(".");
		 sdomains.reverse();
		var dp1 = sdomains.indexOf("net");
		var dp2 = sdomains.indexOf("hwcdn");
		
	 if(dp1===0 && dp2==1) {
		 		 console.log("highwinds matched");
		 var fixedhostname = sdomains.reverse().join(".");
	return fixedhostname;
	 } else return false;
}
function check_for_s3_hostname(hostname){
	if(!hostname) return false;
	 var sdomains = hostname.split(".");
		 sdomains.reverse();
		var dp1 = sdomains.indexOf("com");
		var dp2 = sdomains.indexOf("amazonaws");
		var dp3 = sdomains.indexOf("s3");
		var dp4 = sdomains.indexOf("s3-control");
		var dp5 = sdomains.indexOf("s3-1-w");
		
	 if(dp1===0 && dp2==1) {
		 		 console.log("amazon matched");
				 
				 if(dp5===2) {  //matched  s3-1-w.amazonaws.com
						sdomains[2] = 'us-east-1';
						sdomains[3] = 'dualstack';
						sdomains[4] = 's3';
						console.log("s3 matched");
				 } else if(dp3===3 || dp4===3)
				 {
					sdomains[3] = 'dualstack';
					sdomains[4] = 's3';
					console.log("s3 matched");
				 } else return false;
				 
	var fixedhostname = sdomains.reverse().join(".");
	return fixedhostname;
	
	 } else return false;
}
function check_for_fastly_hostname(hostname){
	if(!hostname) return false;
	 var sdomains = hostname.split(".");
		 sdomains.reverse();
		var dp1 = sdomains.indexOf("net");
		var dp2 = sdomains.indexOf("fastly");
		var	dp3 = sdomains.indexOf("fastlylb");
			
	 if(dp1===0 && ( dp2==1 || dp3 ==1)) {
		 	console.log("fastly matched");
		 var fixedhostname = sdomains.reverse().join(".");
	return fixedhostname;
	 } else return false;
}
function check_for_cloudflare_a(authority){
	console.log('a',authority);
	if(!authority) return false;
	if(authority=='dns.cloudflare.com') {  console.log("cloudflare matched"); return true; } else return false;
}
function check_for_cloudfront_a(authority){
	console.log('a',authority);
	if(!authority) return false;
	if(authority=='awsdns-hostmaster.amazon.com') {  console.log("cloudfront matched"); return true; } else return false;
}
function check_for_fastly_a(authority){
	console.log('a',authority);
	if(!authority) return false;
	if(authority=='hostmaster.fastly.com') {  console.log("fastly matched"); return true; } else return false;
}
function fastlyv4tov6(ipv4){
	console.log('f',ipv4);
	if(!ipv4[0]) return false;

	var hextects = ipv4[0].split(".");
	console.log(hextects[3]);
	
	var fastly_range = '2a04:4e42::'; //anycasted range
	
	if(ipv4.length==1){
		return fastly_range+hextects[3];
	} else {
		var v6hex = ((hextects[2]%64) * 256 + (hextects[3]*1)); //huge thanks @tambry for this expression
		return fastly_range+v6hex;
	}
		
	console.log(hextects[1]);
}
/*async function check_for_cloudflare_ip(ipv4){
	if(!ipv4) return false;
	 await  maxmind.open('GeoLite2-ASN.mmdb').then((lookup) => {
		 var as = lookup.get(ipv4);
		 console.log(as);
		 if(as.autonomous_system_number===13335) {
			 var test = { name: ak, type: 28,  class: 1,  ttl: 30,  address: '1.1.1.1' };
					response.answer.push(test);
					console.log('remote DNS response: ', test);
		 }
	});
}*/