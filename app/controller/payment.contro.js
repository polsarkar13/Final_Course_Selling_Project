const Payment = require("../model/payment.model");
const razorpay = require("../config/razorpay")
const crypto = require("crypto");
const cartModel = require("../model/cart.model");
const nodemailer = require("nodemailer");


class paymentController {
async  createOrder(req, res) {
  try {
    const userId = req.user._id; // logged-in user
    const { amount, cartId } = req.body;
    const cart = await cartModel.findById(cartId);
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    const payment = await Payment.create({
      user: userId,
      cart: cartId,
      razorpay_order_id: order.id,
      amount: amount,
      status: "created",
      items: cart.items ,
    });

    res.json({
        success: true,
        orderId: order.id,       
        amount: order.amount,    
        currency: order.currency 
      });

  } catch (error) {
    console.log(error);
  }
}
async verifyPayment(req, res) {

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {

    
    await Payment.findOneAndUpdate(
      { razorpay_order_id },
      {
        razorpay_payment_id,
        razorpay_signature,
        status: "paid"
      }
    );
    await cartModel.findOneAndUpdate(
  { user: req.user._id },
  { items: [], totalAmount: 0 }
);

    res.json({ success: true });

  } else {

    await Payment.findOneAndUpdate(
      { razorpay_order_id },
      { status: "failed" }
    );

    res.json({ success: false });
  }
}
async paymentSucces(req,res){
    const cart = await cartModel.findOne({ user: req.user._id });
    const cartCount = cart ? cart.items.length : 0;
    const payment = await Payment.findOne({
    user: req.user._id,
    status: "paid"
  }).sort({ createdAt: -1 }); 

  
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
      
  
       await transporter.sendMail({
      to: req.user.email,
      subject: "Payment Successful - AlgoMoney",
      html: `
        <h2>Payment Successful 🎉</h2>
        <p>Hi ${req.user.firstName},</p>
        <p>Your payment was successful.</p>
        
        <p><strong>Amount Paid:</strong> ₹${payment.amount}</p>
        <p><strong>Payment ID:</strong> ${payment.razorpay_payment_id}</p>

        <br>
        <a href="http://localhost:4006/user/my-courses" 
           style="padding:10px 20px;background:#6366f1;color:#fff;text-decoration:none;border-radius:6px;">
           View My Purchases
        </a>

        <br><br>
        <p>Thank you for trusting us ❤️</p>
      `,
    });

    req.flash("success", "Payment successful! Check your email.");

  res.render("user/payment-success", {
    user:req.user,
    amount:    payment?.amount || null,
    paymentId: payment?.razorpay_payment_id || null,
    cartCount:cartCount,
  });

}
async myPurchasedcourses (req, res) {
    
    const cart = await cartModel.findOne({ user: req.user._id });
    const cartCount = cart ? cart.items.length : 0;
  
  const payments = await Payment.find({
    user: req.user._id,
    status: "paid"
  }).sort({ createdAt: -1 });

 
 const purchasedItems = [];

payments.forEach(payment => {
  if (payment.items) {
    payment.items.forEach(item => {
      purchasedItems.push(item);
    });
  }
});

  
  const courses    = purchasedItems.filter(i => i.itemType === "course");
  const portfolios = purchasedItems.filter(i => i.itemType === "portfolio");
  const plans      = purchasedItems.filter(i => i.itemType === "plan");

  res.render("user/my-courses", { 
    user:req.user,
    courses, 
    portfolios, 
    plans,cartCount});
}
}
module.exports = new paymentController();