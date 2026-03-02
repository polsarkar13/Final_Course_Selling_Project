const express = require ("express");
const router = express.Router()
const paymentController = require("../controller/payment.contro")
const UserController = require("../controller/user.contro")
const userAuth  = require("../middleware/verify.user.Token")



router.get("/dashboard",userAuth,UserController.userHomePage)
router.get("/register",UserController.RegisterPage)
router.get("/login",UserController.SigninPage)
router.get("/contact",userAuth,UserController.ContactPage)
router.get("/about",userAuth,UserController.AboutPage)
router.get("/algo",userAuth,UserController.AlgoPage)
router.get("/logout",userAuth,UserController.logout)

router.post("/signup",UserController.signup);
router.get(
  "/verify-email/:token",
  UserController.verifyEmail
);
router.post("/login",UserController.login);
router.get("/portfolio",userAuth,UserController.portfolioPage)
router.get("/courses",userAuth,UserController.coursesPage)
router.get("/courses",userAuth,UserController.coursesPage)
router.get("/course/:id",userAuth,UserController.courseDetailsPage)
router.get("/portfolio/:id",userAuth,UserController.portfolioDetailsPage)

router.get("/starterplan/:id",userAuth,UserController.starterplanPage)
router.get("/proplan/:id",userAuth,UserController.proplanPage)
router.get("/eliteplan/:id",userAuth,UserController.eliteplanPage)
router.get("/cart",userAuth,UserController.cartPage)
router.post("/add-to-cart", userAuth, UserController.addToCart);
router.get("/cart/remove/:id", userAuth, UserController.removeCart);



router.post("/create-order",userAuth, paymentController.createOrder);
router.post("/verify-payment",userAuth, paymentController.verifyPayment);
router.get("/payment-success",userAuth,paymentController.paymentSucces);
router.get("/my-courses",userAuth,paymentController.myPurchasedcourses);




module.exports = router;