const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "cart"
  },
  items: [
  {
    itemId: mongoose.Schema.Types.ObjectId,
    itemType: String,
    title: String,
    price: Number
  }
],
  razorpay_order_id: String,
  razorpay_payment_id: String,
  razorpay_signature: String,
  amount: Number,
  currency: {
    type: String,
    default: "INR"
  },
  status: {
    type: String,
    enum: ["created", "paid", "failed"],
    default: "created"
  }
}, { timestamps: true });

const paymentModel= mongoose.model("payment", paymentSchema);
module.exports =paymentModel