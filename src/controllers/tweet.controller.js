import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content}=req.body
    if(!content){
        throw new ApiError(200,"content not founds")
    }

    const tweet=await Tweet.create({
        content:content,
        owner:req.user?._id
    })
    
    if(!tweet){
        throw new ApiError(400,"tweet not created")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,tweet,"Tweet Successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId}=req.params
    if(!userId){
        throw new ApiError(404,"User not found")
    }

    const user=await User.findById(userId)
    if(!user){
        throw new ApiError(404,"User not found")
    }
    

    const getTweet=await Tweet.find({owner:userId})
    if(!getTweet){
        throw new ApiError(404,"Tweet not found")
    }
    console.log("getTweet: ",getTweet)
    
    // 5. Get total tweets count for pagination
    const totalTweets = await Tweet.countDocuments({ owner: userId });

    // 6. Return response
    return res.status(200).json(
        new ApiResponse(200, {
            getTweet,
           totalTweets: totalTweets
        }, "User tweets fetched successfully")
    );
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId}=req.params
     if(!tweetId){
        throw new ApiError(404,"tweet not found")
    }

    const {content}=req.body
    if(!content){
        throw new ApiError(200,"content not founds")
    }
    const tweet=await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(404,"tweet not found")
    }
    const updateTweet = await Tweet.findByIdAndUpdate(tweetId,{
        content
      },{new:true});
    if(!updateTweet){
        throw new ApiError(200,"tweet not update")
    }

    // 6. Return response
    return res.status(200).json(
        new ApiResponse(200, {
            updateTweet,        
        }, "tweet update successfully")
    );
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
     const {tweetId}=req.params
     if(!tweetId){
        throw new ApiError(404,"tweet not found")
    }

    const deleteTweet = await Tweet.findByIdAndDelete(tweetId);
    if(!deleteTweet){
        throw new ApiError(200,"tweet not delete")
    }

    // 6. Return response
    return res.status(200).json(
        new ApiResponse(200, {
            deleteTweet: deleteTweet,        
        }, "tweet delete successfully")
    );
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}