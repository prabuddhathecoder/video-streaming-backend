import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
// import {uploadOnCloudinary} from "../utils/cloudinary.js"
// import { upload } from "../middelwares/multer.middelware.js"
import { uploadFile } from "../utils/fileUploder.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

   if (
        [title, description].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }
   
    // video and thamnail  upload in cloud
    const localVideoPath=req.files?.videoFile[0]?.path
    console.log("localVideoPath: ",localVideoPath)
    if(!localVideoPath){
        throw new ApiError(404,"video File not found")
    }
    const localThambnailPath=req.files?.thumbnail[0]?.path
    console.log("localThambnailPath: ",localThambnailPath)

    if(!localThambnailPath){
        throw new ApiError(404,"Thambnail File not found")
    }

    console.log("localThambnailPath",localThambnailPath)
    console.log("localVideoPath",localVideoPath)
    const uploadedVideo=await uploadFile(localVideoPath)
    const uploadThambnail=await uploadFile(localThambnailPath)

    //get user
    const user=await User.findById(req.user?._id)
     if(!user){
        throw new ApiError(404,"user not found")
    }

    console.log("updated Video duration: ",uploadedVideo.duration)
// create video
    const videoPublished=await Video.create({
            videoFile: updateVideo?.url,
            thumbnail: uploadThambnail?.url || uploadedVideo.url, // Use video URL as thumbnail if no separate thumbnail
            title: title.trim(),
            description: description.trim(),
            duration: uploadedVideo.duration || 0, // Extract duration from Cloudinary response if available
            owner: user._id,
          
})

//  return RESPONSE

return res
.status(200)
.json(new ApiResponse(200,videoPublished,"video Published"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!videoId){
        throw ApiError(404,"video not found")
    }

    // check video in published or not

    const isVideoPublished=await Video.findOne({
        _id:videoId,
        isPublished:true
    })

    if(!isVideoPublished){
        throw ApiError(404,"video not published")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,isVideoPublished,"video fatched successfully"))

})

const updateVideo = asyncHandler(async (req, res) => {
     //TODO: update video details like title, description,     
    // Get the videoId from req.params.
    const { videoId } = req.params
   
    if(!videoId){
        throw new ApiError(404,"video not found")
    }
// Get the new details from req.body (e.g., title, description, ).
    const {title, description } = req.body
    // TODO: get video, upload to cloudinary, create video
console.log("title: ",title)
console.log("des: ",description)
   if (
        [title, description].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }
    //Update the video.

const updateVideo=await Video.findByIdAndUpdate(videoId,{
    title,
    description,
    },{new:true})

// Return the updated video.
    return res
    .status(200)
    .json(new ApiResponse(200,updateVideo,"video update successfully"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    //TODO: delete video
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(404,"Video not found")
    }
    const video=await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"Video not exist")
    }

//delete video from db 
    const deleteVideo=await Video.findByIdAndDelete(videoId)

    if(!deleteVideo){throw new ApiError(400,"video not valid")}
    return res
    .status(200)
    .json(new ApiResponse(200,deleteVideo,"video delete successfully"))
    
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!videoId){throw new ApiError(400,"video not valid")}

    //video onwer find
    const videoOwner=await Video.findOne(
        {   _id:videoId,
            owner:req.user?._id,
        }
    )
    
    if(!videoOwner){throw new ApiError(400,"video owner not valid")}

    const publishStatus=await Video.findByIdAndUpdate(videoId,
        {
        isPublished:true
    },{new:true})
    if(!publishStatus){throw new ApiError(400,"status not changed")}


    return res
    .status(200)
    .json(new ApiResponse(200, publishStatus,`Video ${publishStatus.isPublished ? 'published' : 'unpublished'} successfully`))


})

export {
    getAllVideos,
    publishVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}