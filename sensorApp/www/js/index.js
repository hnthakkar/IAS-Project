'use strict';

//var configOfSensor = "C{'ID':'sen1','Type':'ecgSensor','Location':'kondapur'}";
var configOfSensor = 'C{"ID":"sen1","Type":"heatSensor","Location":"kondapur"}';
var configSent = false;
var count = 0;

var app = {
    initialize: function() {
        this.bind();
        listButton.style.display = "none";
    },
    bind: function() {
        document.addEventListener('deviceready', this.deviceready, false);
    },
    deviceready: function() {
        // note that this is an event handler so the scope is that of the event
        // so we need to call app.foo(), and not this.foo()

        // wire buttons to functions
        connectButton.ontouchstart = app.connect;
        listButton.ontouchstart = app.list;

        sendButton.ontouchstart = app.sendData;
		chatform.onsubmit = app.sendData;
		sendConfig.ontouchstart = app.sendConfig;
        disconnectButton.ontouchstart = app.disconnect;

        // listen for messages
        bluetoothSerial.subscribe("\n", app.onmessage, app.generateFailureFunction("Subscribe Failed"));

        // get a list of peers
        setTimeout(app.list, 2000);
    },
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
		configSent = false;
        bluetoothSerial.disconnect(app.ondisconnect);
    },
    sendData: function(event) {
        //event.preventDefault();
		//alert(message.value);
        //var text = "Sensor1:" + new Date() + ":" + message.value + "\n";
        var success = function (data) {
            message.value = "";
            messages.value += (data);
            messages.scrollTop = messages.scrollHeight;
        };
		
		//bluetoothSerial.write(text, success);
		//for (var i = 1; i <= 5; i++) {
			//setTimeout(function(x) { 
				//return function() { 
						//if(i%2==0){
							//bluetoothSerial.write(configOfSensor + "\n", success);
						//} else {
							var temp = Math.floor(Math.random() * (200 - 60)) + 60;
							//var data = "{'ID':'sen1','DateTime':'" + new Date() + "','value':'" + temp + "'}\n";
							var data = '{"ID":"sen1","DateTime":"' + new Date() + '","value":' + temp + '}\n';
							//var data = {};
							//console.log("result2[i]['sensor_id']"+result2[j]['sensor_id']);
							//data["ID"] =  "Sensor1";
					  		//data["sensorValue"] = 12;
							//temp["sensorValue"] = sensorLatestData["sensorId"]
							//data["DateTime"] = new Date();
							//temp["sensorLocation"] = result2[j]["sensor_location"];
							//var detailedInfo_app_global.push(temp);
							bluetoothSerial.write(data, success(data));
						//}						
				//}; }(i), i*5000);
		//}
		//if(!configSent){
			//bluetoothSerial.write(configOfSensor + "\n", success);
			//configSent = true;
		//}	
		//for(i=0;i<10;i++){
		//var i = 0;
		//while(i < 10) {
		//if(count%5 == 0){
			//bluetoothSerial.write(configOfSensor + "\n", success);
		//} else {
			//bluetoothSerial.write(text, success);
		//}	
		//setTimeout(app.sendData(), 5000);
			//i++;
		//}
		//bluetoothSerial.write(text, success);
		//bluetoothSerial.write(text, success);
		//bluetoothSerial.write(text, success);
			//setTimeout(sendData, 3000);
			//return true;
		//}	
        return true;
    },
	sendConfig: function(event) {
		//var text = message.value + "\n";
		var success = function () {
            message.value = "";
            messages.value += (configOfSensor.substring(1) + "\n");
            messages.scrollTop = messages.scrollHeight;
        };
		bluetoothSerial.write(configOfSensor + "\n", success);
		return true;
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
        connection.style.display = "none";
        chat.style.display = "block";
        app.setStatus("Connected");
		//bluetoothSerial.write(configOfSensor + "\n", function(){});
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
        messages.value += "Them: " + message;
        messages.scrollTop = messages.scrollHeight;
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
