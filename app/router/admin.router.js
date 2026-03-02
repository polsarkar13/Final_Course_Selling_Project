const express = require ("express");
const router = express.Router()

const adminController = require("../controller/admin.contro");
const adminAuth  = require("../middleware/verify.admin.Token")
const upload = require("../middleware/multer");




router.get("/dashboard",adminAuth,adminController.admindashboardPage)
router.get("/profile",adminAuth,adminController.Profilepage)
router.get("/signup",adminController.SignupPage)
router.get("/login",adminController.loginPage)
router.get("/courses",adminController.coursePage)
router.get("/plans",adminController.planPage)
router.post("/create-plan",adminController.createPlan)
router.get("/toggle-plan/:id", adminController.togglePlan);
router.get("/update-plan/:id",adminController.UpdateplanPage)
router.post("/update-plan/:id",adminController.updatePlan)
router.delete("/delete-plan/:id",adminController.deletPlan)

router.get("/update-course/:id",adminController.UpdatecoursePage)
router.get("/update-portfolio/:id",adminController.UpdatePortfolioPage)
router.post("/update-course/:id",adminController.updateCourse)
router.post("/update-portfolio/:id",adminController.updatePortfolio)
router.delete("/delete-user/:id",adminController.deleteuser)
router.delete("/delete-course/:id",adminController.deletCourse)

router.get("/toggle-course/:id",adminController.togglecourse)
router.get("/users",adminController.userPage)
router.get("/toggle-user/:id",adminController.toggleUser)
router.get("/logout",adminController.logout)
router.post("/update-profile",adminAuth,adminController.updateProfile)
router.post("/change-password",adminAuth,adminController.updatePassword)

router.post("/signup",adminController.signup);
router.get("/verify-email/:token",adminController.verifyEmail);
router.post("/login",adminController.login);
router.get("/portfolio-management", adminController.portfolioPage);
router.get("/toggle-portfolio/:id", adminController.togglePortfolio);
router.get("/payments", adminAuth, adminController.getAllPayments);
router.post(
  "/create-portfolio",
  upload.fields([
    { name: "equityCurve", maxCount: 1 },
    { name: "monthlyReport", maxCount: 1 },
    { name: "performanceStats", maxCount: 1 },
  ]),
  adminController.createPortfolio
);
router.post(
  "/create-course",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
  ]),
  adminController.createcourse
);
// router.get("/toggle-portfolio/:id", adminController.togglePortfolio);
// router.get("/delete-portfolio/:id", adminController.deletePortfolio);






module.exports = router;