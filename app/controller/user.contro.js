const bcrypt = require("bcryptjs");
const crypto = require("crypto");
// const adminModel = require("../model/admin.model");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const userModel = require("../model/user.model");
const portfolioModel = require("../model/portfolio.model");
const courseModel = require("../model/course.model");
const planModel = require("../model/plan.model");
const cartModel = require("../model/cart.model");

class userController {
  async userHomePage(req, res) {
    try {
      const users = await userModel.find({ isActive: true });
      const plans = await planModel.find({ isActive: true });
      const cart = await cartModel.findOne({ user: req.user._id });
  const cartCount = cart ? cart.items.length : 0;
  
      const planData = {};
      plans.forEach((plan) => {
        planData[plan.title] = plan;
      });
      res.render("user/Udashboard", {
        user: users || null,
        plans: planData,
        cartCount:cartCount||0,
      });
    } catch (err) {
      console.log(err);
      res.redirect("/user/login");
    }
  }
  async RegisterPage(req, res) {
   
  
    res.render("user/register", {
      user: req.user || null,
      cartCount:[]||0,
    });
  }
  async SigninPage(req, res) {
     
    res.render("user/signin", {
      user: req.user || null,
      cartCount:[]||0,
    });
  }
  async ContactPage(req, res) {
    const cart = await cartModel.findOne({ user: req.user._id });
  const cartCount = cart ? cart.items.length : 0;
  
    res.render("user/contact", {
      user: req.user || null,
      cartCount,
    });
  }
  async AboutPage(req, res) {
    const cart = await cartModel.findOne({ user: req.user._id });
  const cartCount = cart ? cart.items.length : 0;
  
    res.render("user/about", {
      user: req.user || null,
      cartCount,
    });
  }
  async AlgoPage(req, res) {
    const cart = await cartModel.findOne({ user: req.user._id });
  const cartCount = cart ? cart.items.length : 0;
  
    res.render("user/algo", {
      user: req.user || null,
      cartCount,
    });
  }
  async signup(req, res) {
    try {
      const { firstName, lastName, email, phone, password } = req.body;
      const hasspassword = await bcrypt.hash(password, 10);
      const user = await userModel.create({
        firstName,
        lastName,
        email,
        phone,
        password: hasspassword,
      });
      const token = crypto.randomBytes(32).toString("hex");

      const hasstoken = crypto.createHash("sha256").update(token).digest("hex");
      user.emailVerificationToken = hasstoken;
      user.emailVerificationExpires = Date.now() + 15 * 60 * 1000;

      await user.save();

      const verifyURL = `${req.protocol}://${req.get(
        "host",
      )}/user/verify-email/${token}`;

      // Send email
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        to: user.email,
        subject: "Verify Your Email | AlgoMoney",
        html: `
  <div style="margin:0;padding:0;background-color:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
      <tr>
        <td align="center">

          <table width="600" cellpadding="0" cellspacing="0" 
          style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 5px 20px rgba(0,0,0,0.08);">

            <!-- Header -->
            <tr>
              <td style="background:#0f172a;padding:25px;text-align:center;">
                <h1 style="color:#ffffff;margin:0;font-size:24px;">
                  ⚡ AlgoMoney
                </h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:40px 30px;text-align:center;">
                <h2 style="margin:0 0 15px;font-size:22px;color:#0f172a;">
                  Verify Your Email Address
                </h2>

                <p style="color:#475569;font-size:15px;line-height:1.6;">
                  Thank you for registering with AlgoMoney.  
                  To activate your account and access your dashboard, please verify your email address.
                </p>

                <!-- Button -->
                <a href="${verifyURL}" 
                style="
                  display:inline-block;
                  margin-top:25px;
                  padding:14px 28px;
                  background:#22c55e;
                  color:#ffffff;
                  text-decoration:none;
                  border-radius:8px;
                  font-weight:bold;
                  font-size:15px;">
                  Verify My Account
                </a>

                <p style="margin-top:25px;color:#64748b;font-size:13px;">
                  This link will expire in 24 hours for security reasons.
                </p>

                <p style="margin-top:15px;color:#94a3b8;font-size:12px;">
                  If you did not create an account, please ignore this email.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f8fafc;padding:20px;text-align:center;">
                <p style="margin:0;color:#64748b;font-size:12px;">
                  © ${new Date().getFullYear()} AlgoMoney. All rights reserved.
                </p>
                <p style="margin:5px 0 0;color:#94a3b8;font-size:11px;">
                  Secure • Transparent • Professional Trading Education
                </p>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </div>
  `,
      });
      req.flash(
        "success",
        "Signup successful! Please check your email to verify your account.",
      );
      res.redirect("/user/login");
    } catch (err) {
      console.log(err);
      req.flash("error", "Signup Failed");
      res.redirect("/user/login");
    }
  }
  async verifyEmail(req, res) {
    try {
      const hashedToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

      const user = await userModel.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.send("Invalid or expired token");
      }

      user.isVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;

      await user.save();

      req.flash("success", "Email verified successfully!");
      res.redirect("/user/login");
    } catch (err) {
      console.log(err);
      req.flash("error", "Invalid credentials");
      res.redirect("/user/login");
    }
  }
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const finduser = await userModel.findOne({ email });
      if (!finduser) {
        req.flash("error", "Invalid email or password");
        return res.redirect("/user/login");
      }
      const checkpassword = await bcrypt.compare(password, finduser.password);
      if (!checkpassword) {
        req.flash("error", "Wrong Password");
        res.redirect("/user/login");
      }
      if (!finduser.isVerified) {
        req.flash("error", "Email Not Verified");
        res.redirect("/user/login");
      }
      const token = jwt.sign({ id: finduser._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      res.cookie("userToken", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      req.flash("success", `Welcome ${finduser.firstName}`);
      return res.redirect("/user/dashboard");
    } catch (err) {
      console.log(err);
      req.flash("error", "Invalid credentials");
      res.redirect("/user/login");
    }
  }
  async portfolioPage(req, res) {
    try {
      const portfolios = await portfolioModel.find({ isActive: true });
      const cart = await cartModel.findOne({ user: req.user._id });
  const cartCount = cart ? cart.items.length : 0;
  

      res.render("user/portfolio", {
        portfolios,
        user: req.user || null,
        cartCount,
      });
    } catch (err) {
      console.log(err);
      res.redirect("/user/dashboard");
    }
  }
  async coursesPage(req, res) {
    try {
      const courses = await courseModel
        .find({ isActive: true })
        .sort({ createdAt: -1 });
        const cart = await cartModel.findOne({ user: req.user._id });
  const cartCount = cart ? cart.items.length : 0;
  
      res.render("user/courses", {
        courses: courses || null,
        user: req.user || null,
        cartCount,
      });
    } catch (err) {
      console.log(err);
      res.redirect("/user/dashboard");
    }
  }
  async courseDetailsPage(req, res) {
    try {
      const { id } = req.params;

      const course = await courseModel.findById(id);
      // console.log(course)
      const cart = await cartModel.findOne({ user: req.user._id });
  const cartCount = cart ? cart.items.length : 0;
  

      if (!course) {
        return res.redirect("/user/courses");
      }

      res.render("user/course-details", {
        course,
        user: req.user || null,
        cartCount,
      });
    } catch (err) {
      console.log(err);
      res.redirect("/user/courses");
    }
  }
  async portfolioDetailsPage(req, res) {
    try {
      const { id } = req.params;

      const portfolio = await portfolioModel.findById(id);
      const cart = await cartModel.findOne({ user: req.user._id });
  const cartCount = cart ? cart.items.length : 0;
  

      if (!portfolio) {
        return res.redirect("/user/portfolio");
      }

      res.render("user/portfolio-details", {
        portfolio,
        user: req.user || null,
        cartCount,
      });
    } catch (err) {
      console.log(err);
      res.redirect("/user/portfolio");
    }
  }
  async logout(req, res) {
    try {
      res.clearCookie("userToken");
      res.redirect("/user/login");
    } catch (error) {
      console.log(error);
      res.redirect("/user/login");
    }
  }
  async starterplanPage(req, res) {
    try {
      const user = req.user;
      const portfolio = await portfolioModel.find({
        price: { $lt: "6000" },
        isActive: true,
      });
      const cart = await cartModel.findOne({ user: req.user._id });
  const cartCount = cart ? cart.items.length : 0;
  
      res.render("user/starterplan", {
        user: user,
        portfolios: portfolio,
        cartCount,
      });
    } catch (error) {
      console.log(error);
    }
  }
  async proplanPage(req, res) {
    try {
      const user = req.user;
      const proPlan = await planModel.findOne({title:"pro",isActive: true})
      const cart = await cartModel.findOne({ user: req.user._id });
  const cartCount = cart ? cart.items.length : 0;
  
      // console.log(proPlan)
      const proPlanPrice = proPlan.price;
      // console.log(proPlanPrice)
      const course = await courseModel.find({
        "details.price": { $lt: "13000" },
        isActive: true,
      });
      const portfolio = await portfolioModel.find({
        price: { $lt: "8000" },
        isActive: true,
      });
      //  console.log("portfolioPRO",portfolio)
      res.render("user/proplan", {
        user: user,
        portfolios: portfolio,
        courses: course,
        proPlanPrice,
        cartCount,
        proPlan,
      });
    } catch (error) {
      console.log(error);
    }
  }
  async eliteplanPage(req, res) {
    try {
      const user = req.user;
      const elitePlan = await planModel.findOne({title:"elite",isActive: true})
      const cart = await cartModel.findOne({ user: req.user._id });
  const cartCount = cart ? cart.items.length : 0;
  
      // console.log(proPlan)
      const elitePlanPrice = elitePlan.price;
      // console.log(proPlanPrice)
      const course = await courseModel.find({
        "details.price": { $lt: "15000" },
        isActive: true,
      });
      const portfolio = await portfolioModel.find({
        price: { $lt:"55000" },
        isActive: true,
      });
      // console.log(portfolio)
      res.render("user/eliteplan", {
        user: user,
        portfolios: portfolio,
        courses: course,
        elitePlanPrice,
        elitePlan,
        cartCount,
      });
    } catch (error) {
      console.log(error);
    }
  }
  async addToCart(req, res) {
  try {

    const userId = req.user._id;
    const { itemId, itemType } = req.body;

    let item;
    let price;
    let title;

    
    if (itemType === "course") {
      item = await courseModel.findById(itemId);
      price = item.details.price;
      title = item.title;
    }

    if (itemType === "portfolio") {
      item = await portfolioModel.findById(itemId);
      price = item.price;
      title = item.name;
    }

    if (itemType === "plan") {
      item = await planModel.findById(itemId);
      price = item.price;
      title = item.title;
    }

    if (!item) return res.redirect("back");

    // Find or create cart
    let cart = await cartModel.findOne({ user: userId });

    if (!cart) {
      cart = new cartModel({
        user: userId,
        items: [],
      });
    }

    
    const alreadyExists = cart.items.find(
      i => i.itemId.toString() === itemId
    );

    if (!alreadyExists) {
      cart.items.push({
        itemId,
        itemType,
        price,
        title,
      });
    }

  
    cart.totalAmount = cart.items.reduce(
      (sum, item) => sum + item.price,
      0
    );

    await cart.save();

    res.redirect("/user/cart");

  } catch (error) {
    console.log(error);
  }
 }
  async cartPage(req, res) {

  const cart = await cartModel.findOne({ user: req.user._id });
  const cartCount = cart ? cart.items.length : 0;
  
  let totalAmount =0 ;

if (cart) {
  cart.items.forEach(item => {
    totalAmount += item.price;
  });
}

  res.render("user/cart", { 
    user:req.user,
    cart,
  totalAmount,
  razorpayKey: process.env.RAZORPAY_KEY_ID,
 cartCount:cartCount||0 });
  }
  async removeCart(req, res) {
  try {
    const userId = req.user._id;
    const itemId = req.params.id;

    await cartModel.updateOne(
      { user: userId },
      { $pull: { items: { _id: itemId } } }
    );

    // Recalculate total
    const cart = await cartModel.findOne({ user: userId });

    if (cart) {
      cart.totalAmount = cart.items.reduce(
        (sum, item) => sum + Number(item.price),
        0
      );

      await cart.save();
    }

    res.redirect("/user/cart");

  } catch (error) {
    console.log(error);
  }
  }
}

module.exports = new userController();
