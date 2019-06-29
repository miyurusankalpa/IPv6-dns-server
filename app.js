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

let server4 = dns.createServer({ dgram_type: 'udp4' });
let server6 = dns.createServer({ dgram_type: 'udp6' });

resolver.setServers([dns_resolver]);

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

	let f = [];
	
	request.question.forEach(question => {

		if(question.type==1) { //ipv4 request
		
			/*resolver.resolve6(question.name, function(err, v6) {
				if (err) console.log(err.stack);
				console.log(v6);
				if ((v6 === undefined || v6.length == 0)) {
					//no ipv6, send normal ipv4
					f.push(cb => proxy(question, response, cb, true));
				} else {
					//ipv6 send localhost
					f.push(cb => proxy(question, response, cb, false));
				}
			}); */ f.push(cb => proxy(question, response, cb, true));
		} else if(question.type==28) { //ipv6 request
				f.push(cb => proxy(question, response, cb, true));

			} else {
		
			  f.push(cb => proxy(question, response, cb, true));
			
			}
			
				
				
		async.parallel(f, function() {
				//if(question.type==28) response_check(response);
				//console.log('r', response);
				response.send();

				});

	});

}

function proxy(question, response, cb, noa) {
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
		if(!noa) {
			msg.header.rcode=3;
			msg.answer=[];
		} else {
			//msg.answer.forEach(a => {
					//console.log('remote DNS response: ', a)	
			//});
			
			
			var last_hostname; var last_type; var test;
			for (const a of msg.answer) {
					last_hostname = a.data; last_type = a.type;
					response.answer.push(a);
				}
				
			var ak = check_for_akamai_hostname(last_hostname);
				if(ak) {
						var addresses = dnsSync.resolve(ak, 'AAAA');

						test = { name: ak, type: 28,  class: 1,  ttl: 30,  address: addresses[0] };
					}
			
			if((last_type===5) && (test)){ //cname
				response.answer.push(test);
				console.log('remote DNS response: ', test);
			}
		}
		
		console.log('m', msg);
	});

	request.on('end', cb);
	request.send();
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