'use strict';

var keyS1 = "";
var keyS2 = "";
var host = "192.168.43.2";

var app = {
    initialize: function() {
		//alert("In initialize");
        this.bind();
		//this.bindEvents();
        listButton.style.display = "none";
		//window.tlantic.plugins.socket.connect(app.onSocketConnect, app.stub, host, 18002);
		document.addEventListener('SOCKET_RECEIVE_DATA_HOOK', function (ev) {
                                  //alert('Data has been received: ', JSON.stringify(ev.metadata));
                                  
                                  //alert(ev.metadata.data);
                                  
                                  var p = JSON.parse(ev.metadata.data);
                                  //alert(p);
                                  
                                  });
    },
    bind: function() {
        document.addEventListener('deviceready', this.deviceready, false);
    },
	/*bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },*/
	stubS1: function(d) {
         //alert("stub : " + d);
    },
    onSocketConnectS1: function(k) {
        //alert('Established connection with :'+ k);
		keyS1 = k;
		//window.tlantic.plugins.socket.send(app.stub, app.stub, key, "7");
    },
	stubS2: function(d) {
         //alert("stub : " + d);
    },
    onSocketConnectS2: function(k) {
        //alert('Established connection with :'+ k);
		keyS2 = k;
		//window.tlantic.plugins.socket.send(app.stub, app.stub, key, "7");
    },
    deviceready: function() {
        // note that this is an event handler so the scope is that of the event
        // so we need to call app.foo(), and not this.foo()

        // wire buttons to functions
        connectButton.ontouchstart = app.connect;
        listButton.ontouchstart = app.list;

        sendButton.ontouchstart = app.sendData;
        chatform.onsubmit = app.sendData;
        disconnectButton.ontouchstart = app.disconnect;

        // listen for messages
        bluetoothSerial.subscribe("\n", app.onmessage, app.generateFailureFunction("Subscribe Failed"));

        // get a list of peers
        setTimeout(app.list, 2000);
    },
	/*onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
	receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },*/
    list: function(event) {
        deviceList.firstChild.innerHTML = "Discovering...";
        app.setStatus("Looking for Bluetooth Devices...");
        bluetoothSerial.list(app.ondevicelist, app.generateFailureFunction("List Failed"));
    },
    connect: function() {
        var device = deviceList[deviceList.selectedIndex].value;
        app.disable(connectButton);
        app.setStatus("Connecting...");
        console.log("Requesting connection to " + device);
        bluetoothSerial.connect(device, app.onconnect, app.ondisconnect);
    },
    disconnect: function(event) {
        if (event) {
            event.preventDefault();
        }

        app.setStatus("Disconnecting...");
        bluetoothSerial.disconnect(app.ondisconnect);
    },
    sendData: function(event) {
        event.preventDefault();

        var text = message.value + "\n";
        var success = function () {
            message.value = "";
            messages.value += ("Us: " + text);
            messages.scrollTop = messages.scrollHeight;
        };
		
		//for(i=0;i<10;i++){
			bluetoothSerial.write(text, success);
		//}	
        return false;
    },
    ondevicelist: function(devices) {
        var option;

        // remove existing devices
        deviceList.innerHTML = "";
        app.setStatus("");

        devices.forEach(function(device) {

            option = document.createElement('option');
            if (device.hasOwnProperty("uuid")) {
                option.value = device.uuid;
            } else if (device.hasOwnProperty("address")) {
                option.value = device.address;
            } else {
                option.value = "ERROR " + JSON.stringify(device);
            }
            option.innerHTML = device.name;
            deviceList.appendChild(option);
        });

        if (devices.length === 0) {

            option = document.createElement('option');
            option.innerHTML = "No Bluetooth Devices";
            deviceList.appendChild(option);

            if (cordova.platformId === "ios") { // BLE
                app.setStatus("No Bluetooth Peripherals Discovered.");
            } else { // Android
                app.setStatus("Please Pair a Bluetooth Device.");
            }

            app.disable(connectButton);
            listButton.style.display = "";
        } else {
            app.enable(connectButton);
            listButton.style.display = "none";
            app.setStatus("Found " + devices.length + " device" + (devices.length === 1 ? "." : "s."));
        }

    },
    onconnect: function() {
		app.initialize();
        connection.style.display = "none";
        chat.style.display = "block";
        app.setStatus("Connected");
    },
    ondisconnect: function(reason) {
        var details = "";
        if (reason) {
            details += ": " + JSON.stringify(reason);
        }
        connection.style.display = "block";
        app.enable(connectButton);
        chat.style.display = "none";
        app.setStatus("Disconnected");
    },
    onmessage: function(message) {
		app.initialize();
		//var text = message.value + "\n";
       /* var success = function () {
            receMsgs.value = "";
            receMsgs.value = ("Last Data Received: " + text);
            receMsgs.scrollTop = receMsgs.scrollHeight;
        }; */
        //alert(message); 
		if(message.indexOf("C{") > -1){
			//alert("Connecting to 18004")
			message = message.substring(1);
			window.tlantic.plugins.socket.connect(app.onSocketConnectS1, app.stubS1, host, 18004);
			window.tlantic.plugins.socket.send(app.stubS1, app.stubS1, keyS1, message);
		} else {
			//alert("Connecting to 18002")
			window.tlantic.plugins.socket.connect(app.onSocketConnectS2, app.stubS2, host, 18002);
			window.tlantic.plugins.socket.send(app.stubS2, app.stubS2, keyS2, message);
		}
		//alert("sending data")
		//window.tlantic.plugins.socket.send(app.stub, app.stub, key, message);
		//receMsgs.value = "";
        receMsgs.value += (message);
        receMsgs.scrollTop = receMsgs.scrollHeight;
		//window.tlantic.plugins.socket.send(stub, stub, key, data);
		//alert("aftr socket send...");
        //receMsgs.value += "Them: " + message;
        receMsgs.scrollTop = receMsgs.scrollHeight;
    },
    setStatus: function(message) { // setStatus
        console.log(message);

        window.clearTimeout(app.statusTimeout);
        statusMessage.innerHTML = message;
        statusMessage.className = 'fadein';

        // automatically clear the status with a timer
        app.statusTimeout = setTimeout(function () {
            statusMessage.className = 'fadeout';
        }, 5000);
    },
    enable: function(button) {
        button.className = button.className.replace(/\bis-disabled\b/g,'');
    },
    disable: function(button) {
        if (!button.className.match(/is-disabled/)) {
            button.className += " is-disabled";
        }
    },
    generateFailureFunction: function(message) {
        var func = function(reason) { // some failure callbacks pass a reason
            var details = "";
            if (reason) {
                details += ": " + JSON.stringify(reason);
            }
            app.setStatus(message + details);
        };
        return func;
    }
};

app.initialize();