
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema for Gateway Server
var gatewayServerSchema = new Schema({
  name: String,
  location: String,
  created_at: Date,
  updated_at: Date
});

// on every save, add the date
gatewayServerSchema.pre('save', function(next) {
  var currentDate = new Date();  
  this.updated_at = currentDate;
  if (!this.created_at)
    this.created_at = currentDate;
  next();
});


var gatewayServer = mongoose.model('gatewayServer', gatewayServerSchema);


module.exports = gatewayServer;

