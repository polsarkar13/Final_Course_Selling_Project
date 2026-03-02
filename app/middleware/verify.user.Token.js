const jwt = require("jsonwebtoken");
const userModel = require("../model/user.model")

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies.userToken;

    if (!token) return res.redirect("/user/login");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded.id);
    //  console.log(user)
    if (!user) 
      return res.redirect("/user/login");
    
    if (!user.isActive) 
      return res.redirect("/user/login");
     //  console.log(user.isActive)

    if (!user.isVerified) 
      return res.redirect("/user/verify-email");

    req.user = user; // store full object

    next();

  } catch (err) {
    // console.log(err)
    return res.redirect("/user/login");
  }
};

module.exports = userAuth; 