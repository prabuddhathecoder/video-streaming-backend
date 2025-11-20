import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB=async()=>{
   try {
     
 const ConObj= await mongoose.connect(`${process.env.DB_URL}/${DB_NAME}`)  
  
     console.log(`DB connected *${ConObj.connection.host}`);
 
} catch (error) {
    
    console.log(`DB Error ${error}`)
    throw error
    process.exit(1)
   }

}
export default connectDB