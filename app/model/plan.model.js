const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      enum:["starter","pro","elite"],
      required: true,
    },
    price:{
     type:Number,
    },
    isActive: {
      type:Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const planModel = mongoose.model("plan", planSchema);
module.exports = planModel;
