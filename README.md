# Introduction

A simple Node DNS Server proxy based on [Peteris Rocks tutorial](https://peteris.rocks/blog/dns-proxy-server-in-node-js-with-ui/), which filters out IPv4 records, if the server has IPv6 records.

## Running localy

Build the project 

	npm install

Starting the server 

	npm start
	
# Changing DNS Resolvers

Change the `dns_resolver` variable in the app.js file.

# Testing if DNS is working

	$ host google.com 127.0.0.1
	$ host google.com ::1

# Credits
* [Pēteris Ņikiforovs](https://peteris.rocks/)