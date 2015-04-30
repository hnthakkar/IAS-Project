/* jslint node:true */
var net = require('net'),
	clients = [],
	serverInstance,
	onListen,
	onConnect,
	simulPack = {
		"jsonrpc":"2.0",
		"result":{
			"posStatus": "'"
		}
	};

onListen = function () {
	'use strict';
	console.log('Server listening on port ', this.address().port);
};

onConnect = function (socket) {
	'use strict';

	console.log('- Connection from ', socket.remoteAddress, ' on port ', socket.localPort, ' established.');
};
onError = function () {
	'use strict';
	
	console.log('- Socket error due connection unavailability!');
};
var http = require('http');
var ioFilter = require('socket.io-client');
var socketFilter = ioFilter.connect('http://127.0.0.1:7000');

socketFilter.on('connect',function() {

      var fact = '{"ID":"sen1","DateTime":"Tue Apr 14 2015 20:03:21 GMT+0530 (IST)","value":55}';
      console.log('Client has connected to the server!'+fact);
      socketFilter.emit('fact',fact);
      // Add a disconnect listener
      /*socketFilter.on('disconnect',function() {
        console.log('The client has disconnected!');
        socketFilter.destroy();
      });*/
     });


serverInstance = function (socket) {
	'use strict';

	// client identification
	socket.name = socket.remoteAddress + ':' + socket.remotePort;

	// add into client list
	clients.push(socket);

	// handling socket errors
	socket.on('error', onError);
	
	// handle incoming messages
	socket.on('data', function (data) {

		if (data.length > 1 ) {
			console.log('- Received information on port ', socket.localPort, ': ', data.toString('utf-8'));
			console.log('- Replied to ' + socket.name);
			//socket.write('This is my answer: ' + Date.now().toString() + '\n');
			//socket.write(JSON.stringify(simulPack) + '\n');
 			socketFilter.emit('Fact',data);
 //		socket.emit("setRule",rawRule);
		}
	});

	// Remove client from list
	socket.on('end', function () {
		console.log('- Client has been disconnected from server... ');
		clients.splice(clients.indexOf(socket), 1);
	});

};

//net.createServer(serverInstance).listen(18002, onListen).on('connection', onConnect);
net.createServer(serverInstance).listen(18004, onListen).on('connection', onConnect);
