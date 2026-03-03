require ("dotenv").config()
const Dbconnection = require ("./app/config/Db");
const app = require("./app/router/index.router")


Dbconnection();


const port = process.env.PORT;

app.listen(port , ()=>{
    console.log(`Server Running at http://localhost:${port}`)
})