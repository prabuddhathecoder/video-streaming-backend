
import mongoose, {isValidObjectId} from "mongoose"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Like} from "../models/like.model.js"
import { Video } from "../models/video.model.js"
import { Comment } from "../models/comment.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!videoId){
        throw new ApiError(400,"video  required")
    }

   const video=await Video.findById(videoId)
   if(!video){
    throw new ApiError(404,"video not found")
    }

    let liked=false
    const existingLike=await Like.findOne({
        video:videoId,
        likeBy:req.user?._id
    })

    if(existingLike){
         await Like.findByIdAndDelete(existingLike._id)
         liked=false
    }else{

        await Like.create({
            likeBy:req.user?._id,
            video:videoId
        })
        liked=true
    }

    // 5. Get updated like count
    const likeCount = await Like.countDocuments({ video: videoId });

    // 6. Return response
    return res.status(200).json(
        new ApiResponse(200, {
            liked,
            likeCount
        }, liked ? "Video liked successfully" : "Video unliked successfully")
    );
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!commentId){
        throw new ApiError(400,"comment required")
    }

   const comment=await Comment.findById(commentId)
   if(!comment){
        throw new ApiError(404,"comment not found")
    }
    let liked=false
    

    const existingLike=await Comment.findOne({
        likeBy:req.body?._id,
        comment:commentId
    })

    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)
        liked=false

    }{
        await Like.create({
            likeBy:req.body?._id,
            comment:commentId
        })
        liked=true
    }
// 5. Get updated like count
    const likeCount = await Like.countDocuments({ comment: commentId });

    // 6. Return response
    return res.status(200).json(
        new ApiResponse(200, {
            liked,
            likeCount
        }, liked ? "Comment liked successfully" : "comment unliked successfully")
    );

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const {videoId}=req.params
    if(!videoId){
        throw new ApiError(400,"video not fount")
    }

    const getLikedVideos=await Like.findOne(
        {
            video:videoId,
            likeBy:req.user?._id
        }
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
