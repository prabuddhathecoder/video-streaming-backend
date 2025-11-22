
import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {comment}=req.body

    if(comment.trim()==""){
        throw new ApiError(400,"Comment field are required ")
    }
// find video 
    const { videoId }=req.params
    
    if(!videoId){throw new ApiError(404,"video id valid")}


   const video=await Video.findById(videoId)

   if(!video){throw new ApiError(404,"video not found")}

   const commentCreate=await Comment.create({
       content:comment,
       video:videoId,
       owner:req.user?._id

   })
   if(!commentCreate){
    throw new ApiError(404,"comment not created")
   }
     
   return res.status(200)
   .json(new ApiResponse(200,commentCreate,"Comment successfully "))
   
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId}=req.params
    if(!commentId.trim()){
        throw new ApiError(404,"comment not found")
    }
    const {comment}=req.body
    if(!comment){
        throw new ApiError(400,"comment is required")
    }
    console.log("commentId:",commentId)
    console.log("comment:",comment)
    const updateComent=await Comment.findByIdAndUpdate(commentId,
        {
        content:comment

    },{new:true})

    if(!updateComent){
        throw new ApiError(400,"comment not update")
    }
    
    return res
    .status(200)
    .json(new ApiResponse(200,{updateComent:updateComent},"Comment Update successfully"))

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
   const {commentId}=req.params
   if(!commentId){
    throw new ApiError(404,"comment not found")
   }
    
   const commentDelete=await Comment.findByIdAndDelete(commentId)
   if(!commentDelete){
    throw new ApiError(404,"comment not delete")
   }

   return res
   .status(200)
   .json(new ApiResponse(200,commentId,"Comment Delete successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
