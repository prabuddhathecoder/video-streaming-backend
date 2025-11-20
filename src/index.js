import mongoose from "mongoose";
import connectDB from "./db/index.js";
import dotenv from "dotenv"
import {app} from "./app.js"

dotenv.config({
    path:'./env'
})
const PORT=process.env.PORT||8000;


// connect DB code
connectDB()
.then(()=>{
    app.listen(PORT ,()=>{
   console.log(`Server is running at port : ${process.env.PORT}`)
    })
}).catch((err)=>{
    console.log("db Connection fialed !!",err)
}) 