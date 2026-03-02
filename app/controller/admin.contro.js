const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const adminModel = require("../model/admin.model");
const portfolioModel = require("../model/portfolio.model")
const courseModel = require("../model/course.model")
const userModel = require("../model/user.model")
const planModel = require("../model/plan.model")
const Payment = require("../model/payment.model");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

class adminController {
async admindashboardPage(req, res) {

    const users = await userModel.find().sort({createdAt:-1})
    const payments = await Payment.find().populate("user").populate("cart").sort({createdAt:-1})
    
    const totalUsers = await userModel.countDocuments();
    const totalCourses = await courseModel.countDocuments();
    const totalPortfolios = await portfolioModel.countDocuments();
    const lastMonthUsers = await userModel.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
      }
    });

    const totalRevenue =await Payment.aggregate([
      {$match :{status :"paid"}},{
        
          $group:{ 
             _id: null,
             total :{$sum:"$amount"}

          }
        }
      
    ])

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total :0;

    const growth = totalUsers > 0
      ? ((lastMonthUsers / totalUsers) * 100).toFixed(1)
      : 0;
    const stats = {
      // revenue: totalRevenue || 0,
      users: totalUsers || 0,
      courses:totalCourses ||0,
      portfolios:totalPortfolios ||0,
      growth: growth || 0,
      payments:payments ||0,
      revenue:revenue,
      
    };
   
    res.render("admin/dashboard", {
      admin: req.admin,
      users: users,
      stats:stats,
      payments:payments,
      notifications: [] || 0,
    });
}
async SignupPage(req, res) {
    res.render("admin/signup");
}
async loginPage(req, res) {
    res.render("admin/login");
}
async signup(req, res) {
    try {
      const { name, email, password } = req.body;
      const hasspassword = await bcrypt.hash(password, 10);
      const admin = await adminModel.create({
        name,
        email,
        password: hasspassword,
      });
      const token = crypto.randomBytes(32).toString("hex");

      const hasstoken = crypto.createHash("sha256").update(token).digest("hex");
      admin.emailVerificationToken = hasstoken;
      admin.emailVerificationExpires = Date.now() + 15 * 60 * 1000;

      await admin.save();

      const verifyURL = `${req.protocol}://${req.get(
        "host",
      )}/admin/verify-email/${token}`;

    
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        to: admin.email,
        subject: "Verify Your Admin Account",
        html: `
        <h2>Email Verification</h2>
        <p>Click the link below to verify your account:</p>
        <a href="${verifyURL}">${verifyURL}</a>
      `,
      });
      req.flash(
        "success",
        "Signup successful! Please check your email to verify your account.",
      );
      res.redirect("/admin/login");
    } catch (err) {
      console.log(err);
      req.flash("error", "Signup Failed");
      res.redirect("/admin/login");
    }
}
async verifyEmail(req, res) {
    try {
      const hashedToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

      const admin = await adminModel.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: Date.now() },
      });

      if (!admin) {
        return res.send("Invalid or expired token");
      }

      admin.isVerified = true;
      admin.emailVerificationToken = undefined;
      admin.emailVerificationExpires = undefined;

      await admin.save();

      req.flash("success", "Email verified successfully!");
      res.redirect("/admin/login");
    } catch (err) {
      console.log(err);
      req.flash("error", "Invalid credentials");
      res.redirect("/admin/login");
    }
}
async login(req, res) {
    try {
      const { email, password } = req.body;
      const findadmin = await adminModel.findOne({ email });
      if (!findadmin) {
        req.flash("error", "Invalid email or password");
        return res.redirect("/admin/login");
      }
      const checkpassword = await bcrypt.compare(password, findadmin.password);
      if (!checkpassword) {
        req.flash("error", "Wrong Password");
        res.redirect("/admin/login");
      }
      if (!findadmin.isVerified) {
        req.flash("error", "Email Not Verified");
        res.redirect("/admin/login");
      }
      const token = jwt.sign({ id: findadmin._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      res.cookie("adminToken", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      req.flash(
        "success",
        `Welcome ${findadmin.name} To Your Workplace.`,
      );
      return res.redirect("/admin/dashboard");
    } catch (err) {
      console.log(err);
      req.flash("error", "Invalid credentials");
      res.redirect("/admin/login");
    }
}
async portfolioPage(req, res) {
  const portfolios = await portfolioModel.find().sort({ createdAt: -1 });
  res.render("admin/portfolio", { portfolios });
}
async createPortfolio(req, res) {
  try {
    const {
      name,
      slug,
      description,
      riskLevel,
      price,
      averageAnnualROI,
      maxRiskPerDay,
      capitalExpiryDays,
      capitalNonExpiryDays,
      historicalMaxDD,
      highlight1,
      highlight2,
      highlight3,
      highlight4,
    } = req.body;

    // 🔥 Cloudinary image URLs (from multer)
    const equityCurve = req.files?.equityCurve?.[0]?.path || "";
    const monthlyReport = req.files?.monthlyReport?.[0]?.path || "";
    const performanceStats = req.files?.performanceStats?.[0]?.path || "";

    await portfolioModel.create({
      name,
      slug,
      description,
      riskLevel,
      price,

      performanceSummary: {
        averageAnnualROI: Number(averageAnnualROI) || 0,
        maxRiskPerDay: Number(maxRiskPerDay) || 0,
        capitalExpiryDays: Number(capitalExpiryDays) || 0,
        capitalNonExpiryDays: Number(capitalNonExpiryDays) || 0,
        historicalMaxDD: Number(historicalMaxDD) || 0,
      },

      highlights: [
        highlight1,
        highlight2,
        highlight3,
        highlight4,
      ].filter(Boolean),

      charts: {
        equityCurve,
        monthlyReport,
        performanceStats,
      },

      isActive: true,
    });

    req.flash("success", "Portfolio created successfully");
    res.redirect("/admin/portfolio-management");

  } catch (error) {
    console.error(error);
    req.flash("error", "Something went wrong while creating portfolio");
    res.redirect("/admin/portfolio-management");
  }
}
async UpdatePortfolioPage(req, res) {
  const id = req.params.id
    const findportfolio = await portfolioModel.findById(id);
    res.render("admin/update-portfolio",{
      portfolio:findportfolio|| null
    });
}
async updatePortfolio(req, res){
  const { price,description } = req.body;
  const course = await portfolioModel.findByIdAndUpdate(
    req.params.id,
    { "price": price,description:description},
    { new: true }
  );
  req.flash(
    "success",
    "Portfolio Update Successfully"
  )
  res.redirect("/admin/portfolio-management");
};
async createcourse(req, res) {
  try {
    const {
      title,
      slug,
      category,
      description,
      durationDays,
      rating,
      price,
      originalPrice,
      studentsEnrolled,
      highlight1,
      highlight2,
      highlight3,
      highlight4,
      courseModule1,
      courseModule2,
      courseModule3,
      courseModule4,
      courseModule5,
    } = req.body;

    // console.log(req.body)

    // 🔥 Cloudinary image URLs (from multer)
    const thumbnail = req.files?.thumbnail?.[0]?.path || "";

    const newcourse = await courseModel.create({
      title,
      slug,
      category,
      description,
      details: {
        durationDays: Number(durationDays) || 0,
        rating: Number(rating) || 0,
        studentsEnrolled: Number(studentsEnrolled) || 0,
        price: Number(price) || 0,
        originalPrice: Number(originalPrice) || 0,
      },
      highlights: [
        highlight1,
        highlight2,
        highlight3,
        highlight4,
      ].filter(Boolean),

      courseModules: [
        courseModule1,
        courseModule2,
        courseModule3,
        courseModule4,
        courseModule5,
      ].filter(Boolean),

      image: {
        thumbnail,
      },

      isActive: true,
    });
    
    req.flash("success", "course created successfully");
    res.redirect("/admin/courses");
    // console.log(newcourse)

  } catch (error) {
    console.error(error);
    req.flash("error", "Something went wrong while creating course");
    res.redirect("/admin/courses");
  }
}
async coursePage(req, res) {
    const courses = await courseModel.find().sort({ createdAt: -1 });
    res.render("admin/course",{
      courses:courses|| null
    });
}
async UpdatecoursePage(req, res) {
  const id = req.params.id
    const findcourse = await courseModel.findById(id);
    res.render("admin/update-course",{
      course:findcourse|| null
    });
}
async updateCourse(req, res){
  const { price, originalPrice,description } = req.body;
  const course = await courseModel.findByIdAndUpdate(
    req.params.id,
    { "details.price": price, "details.originalPrice": originalPrice ,description:description},
    { new: true }
  );
  req.flash(
    "success",
    "Course Update Successfully"
  )
  res.redirect("/admin/courses");
};
async userPage(req, res) {
    const users = await userModel.find().sort({ createdAt: -1 });
    res.render("admin/user",{
      users:users|| null
    });
}
async planPage(req, res) {
    const plan = await planModel.find().sort({ createdAt: -1 });
    res.render("admin/plan",{
      plans:plan|| null
    });
}
async createPlan(req,res){
  try{
    const {title , price}=req.body;
    const newPlan = await planModel.create({
      title,
      price,
    })
    req.flash(
    "success",
    "Plan Create Successfully"
  )
  res.redirect("/admin/plans");
  }catch (error) {
    console.log(error);
    req.flash("error", "Something went wrong.");
    res.redirect("/admin/plans");
  }
}
async togglePlan(req, res) {
    const{id} =req.params
    const findPlan = await planModel.findById(id);
    findPlan.isActive = !findPlan.isActive;
    findPlan.save();

    res.redirect("/admin/plans");
}
async UpdateplanPage(req, res) {
  const id = req.params.id
    const findplan = await planModel.findById(id);
    res.render("admin/update-plan",{
      plan:findplan|| null
    });
}
async updatePlan(req, res){
  const { price } = req.body;
  const plan = await planModel.findByIdAndUpdate(
    req.params.id,
    { "price": price},
    { new: true }
  );
  req.flash(
    "success",
    "Plan Update Successfully"
  )
  res.redirect("/admin/plans");
};
async deletPlan(req, res) {
  const {id} = req.params
    const plans = await planModel.findByIdAndDelete(id);
    res.redirect("/admin/plans")
}
async deleteuser(req, res) {
  const {id} = req.params
    const users = await userModel.findByIdAndDelete(id);
    res.redirect("/admin/users")
}
async toggleUser(req, res) {
    const{id} =req.params
    const finduser = await userModel.findById(id);
    finduser.isActive = !finduser.isActive;
    finduser.save();

    res.redirect("/admin/users");
}
async togglePortfolio(req, res) {
    const{id} =req.params
    const finduser = await portfolioModel.findById(id);
    finduser.isActive = !finduser.isActive;
    finduser.save();

    res.redirect("/admin/portfolio-management");
}
async togglecourse(req, res) {
    const{id} =req.params
    const findcourse = await courseModel.findById(id);
    findcourse.isActive = !findcourse.isActive;
    findcourse.save();
    res.redirect("/admin/courses");
}
async deletCourse(req, res) {
  const {id} = req.params
    const courses = await courseModel.findByIdAndDelete(id);
    res.redirect("/admin/courses")
}
async logout(req, res) {
  try {
    res.clearCookie("adminToken");
    res.redirect("/admin/login");
  } catch (error) {
    console.log(error);
    res.redirect("/admin/login");
  }
}
async Profilepage(req, res) {
  res.render("admin/profile", {
    admin: req.admin
  });
}
async updateProfile(req, res) {
  try {

    const adminId = req.admin._id;  

    const { name, email } = req.body;

   const findprofile = await adminModel.findByIdAndUpdate(adminId);
  if(findprofile.name === name && findprofile.email === email ){
      req.flash("error", "No changes detected.");
      return res.redirect("/admin/profile");
    }
   
    findprofile.name = name;
    findprofile.email=email;

    await findprofile.save();
   req.flash(
        "success",
        "Profile Update Successfully.",
      );
    res.redirect("/admin/profile");

  } catch (error) {
    console.log(error);
    res.redirect("/admin/profile");
  }
}
async updatePassword(req, res) {
  try {

    const adminId = req.admin._id;
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const admin = await adminModel.findById(adminId);
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      req.flash("error", "Wrong current password.");
      return res.redirect("/admin/profile");
    }

    if (newPassword !== confirmPassword) {
      req.flash("error", "New password and confirm password must match.");
      return res.redirect("/admin/profile");
    }
    const isSamePassword = await bcrypt.compare(newPassword, admin.password);

    if (isSamePassword) {
      req.flash("error", "New password cannot be same as old password.");
      return res.redirect("/admin/profile");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    admin.password = hashedPassword;
    await admin.save();

    req.flash("success", "Password updated successfully.");
    res.redirect("/admin/profile");

  } catch (error) {
    console.log(error);
    req.flash("error", "Something went wrong.");
    res.redirect("/admin/profile");
  }
}
async getAllPayments(req, res) {
  try {
    const payments = await Payment.find()
      .populate("user")
      .sort({ createdAt: -1 });

    res.render("admin/payments", { 
      payments,

     });

  } catch (error) {
    console.log(error);
  }
}

}

module.exports = new adminController();
