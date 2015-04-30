var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/registry');


var sensor = require('./registry_Sensor_Schema');
var sLocation = '';
var sName = '';
var sType = '';
var sRange = '';
var sGatewayId = '';


process.argv.forEach(function (val, index, array) {

switch (array[index]) {
   case '-location':
     sLocation = array[index+1];
     break;
   case '-name':
     sName = array[index+1];
     break;
   case '-type':
     sType = array[index+1];
     break;
   case '-range':
     sRange = array[index+1];
     break;
   case '-gatewayid':
     sGatewayId = array[index+1];
     break;

 }

});

// create a new user
var newSensor = sensor({
  name: sName,
  location: sLocation,
  sensor_type : sType,
  accessible_range : sRange,
  gateway_id : sGatewayId

});

// save the gateway
newSensor.save(function(err, data) {
  if (err) throw err;

  console.log('Sensor with ID '+ data.id + ' Registered!');

});

