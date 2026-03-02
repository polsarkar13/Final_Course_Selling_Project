const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },

  items: [
    {
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      itemType: {
        type: String,
        enum: ["course", "portfolio", "plan"],
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      title: String,
    },
  ],

  totalAmount: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

 const cartModel= mongoose.model("cart", cartSchema);
 module.exports =cartModel;