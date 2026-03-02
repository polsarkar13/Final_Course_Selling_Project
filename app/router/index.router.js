const express = require ("express")
const app = express();
const session = require("express-session");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");



app.use(
  session({
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(flash());

// Make flash available in all EJS
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});


app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());



const adminRouter = require("./admin.router");
app.use("/admin",adminRouter)

const userRouter = require("./user.router");
app.use("/user",userRouter)


app.set("view engine","ejs")
app.set("views","views")



module.exports=app;