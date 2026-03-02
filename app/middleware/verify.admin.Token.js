const jwt = require("jsonwebtoken");
const adminModel = require("../model/admin.model")

const adminAuth = async (req, res, next) => {
  try {
    const token = req.cookies.adminToken;

    if (!token) return res.redirect("/admin/login");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await adminModel.findById(decoded.id);
    //  console.log(admin)
    if (!admin) return res.redirect("/admin/login");

    req.admin = admin; // store full object

    next();

  } catch (err) {
    // console.log(err)
    return res.redirect("/admin/login");
  }
};

module.exports = adminAuth; 