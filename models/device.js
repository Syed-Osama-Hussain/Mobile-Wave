var mongoose = require("mongoose");

var deviceSchema = new mongoose.Schema({

  model: String,
  company: String,
  description: String,
  price: Number,
  type: String,
  time: Date,
  fileloc:[ String ]

});

module.exports = mongoose.model("Device",deviceSchema);