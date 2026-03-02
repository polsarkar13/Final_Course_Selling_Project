
const mongoose = require ("mongoose")

const Dbconnection = async()=>{
    try{
        await mongoose.connect(process.env.DB_URL);
        console.log("Database Connected")
    }catch (error){
        console.log(error.message);
    }

}


module.exports = Dbconnection