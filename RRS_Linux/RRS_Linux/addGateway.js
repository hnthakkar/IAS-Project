var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/registry');

var gatewayServer = require('./registry_Gateway_Schema');
var gLocation = '';
var gName = '';


process.argv.forEach(function (val, index, array) {

switch (array[index]) {
   case '-location':
     gLocation = array[index+1];
     break;
   case '-name':
     gName = array[index+1];
     break;
 }

});


// Register new Gateway ...

var newGatewayServer = gatewayServer({
  name: gName,
  location: gLocation
});


newGatewayServer.save(function(err, data) {
  if (err) throw err;

  console.log('Gateway with ID '+ data.id + ' Registered!');

});