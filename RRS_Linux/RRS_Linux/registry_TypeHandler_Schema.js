
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema for TypeHandler
var typeHandlerSchema = new Schema({
  name: String,
  sensor_type : String,
  driver_location : String,
  created_at: Date,
  updated_at: Date
});


// on every save, add the date
typeHandlerSchema.pre('save', function(next) {
  var currentDate = new Date();  
  this.updated_at = currentDate;
  if (!this.created_at)
    this.created_at = currentDate;
  next();
});

var typeHandler = mongoose.model('typeHandler', typeHandlerSchema);


module.exports = typeHandler;