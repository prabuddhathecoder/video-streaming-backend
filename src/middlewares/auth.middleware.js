import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";


export const verifyJWT=asyncHandler(async(req,res,next)=>{
    try {
        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")||null

        if(!token){
            throw new ApiError(401,"Unauthorized request")//when i directly hit the any Api in Exicute without login
        }
       const decodeToken= jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
       const user = await User.findById(decodeToken?._id)
       .select("-password -refreshToken")       

       if(!user){
        throw new ApiError(401,"Access Token Invalid request")
       }

       req.user=user;
       next()

    } catch (error) {
        
        throw new ApiError(401,error?.massage||"Invalid Access Token ")
      
    }
}) 