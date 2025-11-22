import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { User } from "../models/user.model.js"
import { uploadFile } from "../utils/fileUploder.js"
import { ApiResponse } from "../utils/apiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        if (!user) throw new Error("User not found for token generation");
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken() // Fixed method name
   
        user.refreshToken = refreshToken // Fixed field name
        await user.save({ validateBeforeSave: false }) // Fixed save options
      console.log('ref tok=>',refreshToken)

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { email, fullName, userName, password } = req.body
  

    // Validation
    if (
        [fullName, email, password, userName].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    // Check if user already exists
    const exitedUser = await User.findOne({
        $or: [{ userName }, { email }]
    })
    if (exitedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    // File upload
    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImgLocalPath = req.files?.coverImg[0]?.path
    let coverImgLocalPath;
    if (req.files && Array.isArray(req.files.coverImg) && req.files.coverImg.length > 0) {
        coverImgLocalPath = req.files.coverImg[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    // Upload files to cloud
    const avatar = await uploadFile(avatarLocalPath)
    let coverImg;
    if (coverImgLocalPath) {
        coverImg = await uploadFile(coverImgLocalPath)
    }

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    // Create user
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImg: coverImg?.url || "",
        email,
        password,
        userName: userName.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    )
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, userName, password } = req.body

    if (!(userName || email)) {
        throw new ApiError(400, "Username or email is required")
    }

    const user = await User.findOne({
        $or: [{ userName }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const { accessToken,  refreshToken } = await generateAccessAndRefreshToken(user._id) // Fixed variable name

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: false
    }
 
    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,  accessToken, refreshToken
                },
                "User logged in successfully"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
   const user= await User.findByIdAndUpdate(
        req.user._id,
        {
            $$unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: false
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {user}, "User logged out"))
})

const refreshAccessToken= asyncHandler(async(req,res,)=>{
   try {
     //access token - we have cookies
     const incomingRefreeshToken= req.cookies.refreshToken || req.body.refreshToken
 
  if(!incomingRefreeshToken){
     throw new ApiError(400,"Unautorized Request")
  }
  const decodeToken= jwt.verify(incomingRefreeshToken,
     process.env.REFRESH_TOKEN_SECRET)
 
    console.log("Decoded Token:",decodeToken)
    const user=await User.findById(decodeToken?._id)
      
    if(!user){
     throw new ApiError(401,"Invalid user refresh Token")
    }
 
    if(incomingRefreeshToken !== user?.refreshToken){
         
     throw new ApiError(401,"refresh Token is expired or used")
 
    }
 
    const options={
     httpOnly:true,
     secure:false
    }
    const { accessToken,  refreshToken } = await generateAccessAndRefreshToken(user._id) // Fixed variable name

   
    console.log("ref Tkn=>",refreshToken)
    
    return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
        new ApiResponse(200,{ 
         refreshToken:refreshToken,
         accessToken:accessToken
            },
         "Access Token Refresh successfully")
        )
   } catch (error) {

        throw new ApiError(401,error?.masssage || "Invalid refresh Token")
   }

})

const currentPasswordChange=asyncHandler(async(req,res)=>{


    const {oldPassword,newPassword}=req.body

    console.log(oldPassword)
    console.log(newPassword)

    const user= await  User?.findById(req.user?._id)


    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)
    console.log(isPasswordCorrect)

    if(!isPasswordCorrect){

        throw new ApiError(401,"OldPassword is incurrect")
    }

    user.password=newPassword
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(
        new ApiResponse(200,{
        password:newPassword
    },"Password Change successfully !!!")
    )
})
const getcurrentUser=asyncHandler((async(req,res)=>{


    if (!req.user) {
     throw new ApiError( 400, "Unauthorized");
  }
    return res
    .status(200)
    .json(
        new ApiResponse(200,req.user
        ,"Current User Fatched successfully")
    )
}))
const updateAccountInfo=asyncHandler(async(req,res)=>{

    const {fullName,email}=req.body

    if(!fullName||email){
        throw new ApiError(401,"All Feilds are required")
    }

    const user=await User.findByIdAndUpdate(req.user?._id,{
        fullName,
        email
    },{new:true}).select('-password')

    return res
    .status(200)
    .json(200,new ApiResponse(user,"User update successflly"))
})
const updateAvatar=asyncHandler(async(req,res)=>{
    
 const avatarLocalPath = req.file?.path
   console.log(
    "file =>",avatarLocalPath)

  if(!avatarLocalPath){
    throw new ApiError(401,"Avarat file is missing")
  }

    const avatar=await uploadFile(avatarLocalPath)
    if(!avatar.url){
        throw new ApiError(401,"error while uploading Avarat file ")
    }

    const user= await User.findByIdAndUpdate(req.user?._id,{avatar:avatar.url},{new :true}).select("-password")
    
    return res.status(200)
    .json(
        new ApiResponse(200,user,"Avatar update successfully"))
})
const updateCoverImg=asyncHandler(async(req,res)=>{
    
  const coverImgLocalPath=  req.file?.path

  if(!coverImgLocalPath){
    throw new ApiError(401,"coverImg file is missing")
  }

const coverImg=await uploadFile(coverImgLocalPath)
  if(!coverImg.url){
      throw new ApiError(401,"error while uploading Avarat file ")
  }

  const user= await User.findByIdAndUpdate(req.user?._id,{coverImg:coverImg.url},{new :true}).select("-password")

  return res.status(200)
  .json(new ApiResponse(200,user,"CoverImage update successfully"))
})

const getUserChannelProfile=asyncHandler(async(req,res)=>{

    const {userName}=req.params
   if(!userName?.trim()){
    throw new ApiError(404,"UserName not fond")
   }  

const channel = await User.aggregate([
    {
        $match: {
            userName: userName?.toLowerCase()
        }
    },
    {
        $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "channel",
            as: "subscribers"
        }
    },
    {
        $lookup: {
            from: "subscriptions", // corrected from "subcriptions"
            localField: "_id",
            foreignField: "subscriber",
            as: "SubscribedTo"
        }
    },
    {
        $addFields: {
            subscribersCount: {
                $size: { $ifNull: [ "$subscribers", [] ] }
            },
            channelSubscribedToCount: {
                $size: { $ifNull: [ "$SubscribedTo", [] ] }
            },
            isSubcribed: {
                $cond: {
                    if: {
                        $in: [
                            req.user?._id,
                            { $ifNull: [ "$subscribers.subscriber", [] ] }
                        ]
                    },
                    then: true,
                    else: false
                }
            }
        }
    },
    {
        $project: {
            fullName: 1,
            userName: 1,
            avatar: 1,
            subscribersCount: 1,
            channelSubscribedToCount: 1,
            isSubcribed: 1,
            email: 1
        }
    }
]);

    if(!channel?.length)
    {
        throw new ApiError(400,"channel does not exist")
    }

        return res
        .status(200)
        .json(
            new ApiResponse(200,channel[0],"user channel fatch successfully")
        )
})

const getWatchHistory=asyncHandler(async(req,res)=>{

   const user = await User.aggregate([
  {
    $match: {
      _id: new mongoose.Types.ObjectId(req.user?._id) // Note: I assume it's req.user._id, not req.user?._d
    }
  },
  {
    $lookup: {
      from: "videos", // Make sure the collection name is correct (plural? 'video' or 'videos'?)
      localField: "watchHistory",
      foreignField: "_id",
      as: "watchHistory",
      pipeline: [
        // This pipeline is for each video in watchHistory
        {
          $lookup: {
            from: "users", // Collection name for users
            localField: "owner",
            foreignField: "_id",
            as: "owner",
            pipeline: [
              {
                $project: {
                  fullName: 1,
                  userName: 1,
                  avatar: 1
                }
              }
            ]
          }
        },
        {
          $addFields: {
            owner: { $first: "$owner" } // Since the owner lookup returns an array, we take the first element (if any)
          }
        }
      ]
    }
  }
]);

if(!user){
    throw new ApiError(400,'user pipe does not exist')
}

    return res
    .status(200)
    .json(
        new ApiResponse(200,
            user[0].watchHistory,
            "watch History fatch successfully"
        )

    )


})

export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    currentPasswordChange,
    getcurrentUser,
    updateAccountInfo,
    updateAvatar,
    updateCoverImg,
    getUserChannelProfile,
    getWatchHistory 
    
  }