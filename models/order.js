var mongoose = require("mongoose");

var orderSchema = new mongoose.Schema({

 device:
   {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Device"
   },
   name: String,
   phone: Number,
   time: Date
});

module.exports = mongoose.model("Order",orderSchema);
