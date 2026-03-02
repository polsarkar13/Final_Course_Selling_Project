const mongoose = require ("mongoose");

const adminSchma = new mongoose.Schema({
    name:{
        type:String,   
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
    },
    isVerified: {
    type: Boolean,
    default: false
  },
emailVerificationToken: String,
emailVerificationExpires: Date,
})

const adminModel = mongoose.model("admin",adminSchma);
module.exports=adminModel;