
import mongoose, {isValidObjectId} from "mongoose"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Like} from "../models/like.model.js"
import { Video } from "../models/video.model.js"
import { Comment } from "../models/comment.model.js"
import { Tweet } from "../models/tweet.model.js"

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
    if(!tweetId){
        throw new ApiError(400,"Tweet required")
    }

    const tweet=await Tweet.findById(tweetId)
   if(!tweet){
        throw new ApiError(404,"tweet not found")
    }

    let liked;
    const tweetAlredyLiked=await Like.findOne({
        likeBy:req.user?._id,
        tweet:tweetId
    })
    
    if(tweetAlredyLiked){
        await Like.findByIdAndDelete(tweetAlredyLiked._id)
        liked=false

    }{
        await Like.create({
            likeBy:req.body?._id,
            tweet:tweetId
        })
        liked=true
    }
    // 5. Get updated like count
    const likeCount = await Like.countDocuments({ tweet: tweetId });

    // 6. Return response
    return res.status(200).json(
        new ApiResponse(200, {
            liked,
            likeCount
        }, liked ? "tweet liked successfully" : "tweet unliked successfully")
    );

}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "User not authenticated");
    }

    // Find all likes by this user and populate video details
    const likedVideos = await Like.find({ 
        likeBy: userId // Use correct field name from your Like model
    }).populate({
        path: "video",
        select: "title description thumbnail duration views owner createdAt",
        match: { _id: { $exists: true } } // Only populate if video exists
    })
    .sort({ createdAt: -1 });
  console.log('likedVideos: ',likedVideos)
    const userLiked= likedVideos.filter(like => like.video !== null)
   if(userLiked.length===0){
        throw new ApiError(404,"user not liked at any video")
    }


    // 6. Return response
    return res.status(200).json(
        new ApiResponse(200, {
            
            user:userId,
            likedVideos
        },   "video liked fatch successfully")
    );
   
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
