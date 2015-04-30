
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema for Sensor
var sensorSchema = new Schema({
  name: String,
  location: String,
  sensor_type : String,
  accessible_range : Number,
  gateway_id : String,
  created_at: Date,
  updated_at: Date
});

// on every save, add the date
sensorSchema.pre('save', function(next) {
  var currentDate = new Date();  
  this.updated_at = currentDate;
  if (!this.created_at)
    this.created_at = currentDate;
  next();
});


var sensor = mongoose.model('sensor', sensorSchema);

module.exports = sensor;