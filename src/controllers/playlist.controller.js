import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { Video } from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if([name,description].some((field)=>(field.trim()==""))){
  
        throw new ApiError(404,"all feild are required")
    }

    const createPlaylist=await Playlist.create(
        {
            name,
            description,
            owner:req.user?._id
        }
    )
if(!createPlaylist){
        throw new ApiError(404,"playlist Not created")
    }
    return res.status(200).json(
        new ApiResponse(200, {
            createPlaylist,        
        }, "playlist created successfully")
    );

    //TODO: create playlist
})

const getUserPlaylists = asyncHandler(async (req, res) => {
     
    const {userId} = req.params

    if(!userId){
       throw new ApiError(404,"playlist not found")
    }

    const user=await User.findById(userId)
    // if(!user){
    //    throw new ApiError(404,"user not valid")
    // }

    const playlist=await Playlist.find({ owner:userId })
    
    if(!playlist){
        throw new ApiError(404,"user playlist Not found")
    }
    const totalCount=await Playlist.countDocuments({ owner:userId})

    return res.status(200).json(
        new ApiResponse(200, {
            playlist: playlist,        
            playlistCount: totalCount,        
        }, "get playlist successfully")
    );

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    if(!playlistId){
  
        throw new ApiError(404,"playlist not found")
    }

    const playlist=await Playlist.findById(playlistId)
    
    if(!playlist){
        throw new ApiError(404,"playlist Not created")
    }
    return res.status(200).json(
        new ApiResponse(200, {
            playlist: playlist,        
        }, "get playlist successfully")
    );

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!playlistId || !videoId){
       throw new ApiError(404,"playlist or video are required")
    }
    const playlist=await Playlist.findById(playlistId)
    if(!playlist){
       throw new ApiError(404,"playlist not found")
    } 
    
    const video=await Video.findById(videoId)

     if(!video){
       throw new ApiError(404,"video not found")
    }
    
    const addVideo=await Playlist.findByIdAndUpdate(playlistId,
       {
            $addToSet: { video: videoId }
        },{
            new:true})

     if(!addVideo){
       throw new ApiError(404,"video not add to playlist")
    }

     return res.status(200).json(
        new ApiResponse(200, {
            addVideo: addVideo,

        }, "add video to playlist successfully")
    );

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
if(!playlistId || !videoId){
       throw new ApiError(404,"playlist or video are required")
    }
    const playlist=await Playlist.findById(playlistId)
    if(!playlist){
       throw new ApiError(404,"playlist not found")
    } 
    
    const video=await Video.findById(videoId)

     if(!video){
       throw new ApiError(404,"video not found")
    }
    
    const removeVideo=await Playlist.findByIdAndUpdate(playlistId,
       {
          $pull:{ video: videoId} 
        },{
            new:true})

     if(!removeVideo){
       throw new ApiError(404,"video not add to playlist")
    }

     return res.status(200).json(
        new ApiResponse(200, {
            deteleVideo: removeVideo,

        }, "video playlist delete successfully")
    );

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!playlistId){
        throw new ApiError(400,"playlist required")
    }
    const playlist=await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(400,"playlist not exist")
    }

    const deletePlaylist=await Playlist.findByIdAndDelete(playlistId)
    if(!deletePlaylist){
        throw new ApiError(400,"playlist not delete")
    }

    return res.status(200).json(
        new ApiResponse(200, {
            deteleplaylist: deletePlaylist,

        }, "playlist delete successfully")
    );
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if(!playlistId){
       throw new ApiError(404,"playlist or video are required")
    }

    if([name,description].some((field)=>(field.trim()==""))){
  
        throw new ApiError(404,"all feild are required")
    }

    const updatePlaylist=await Playlist.findByIdAndUpdate(playlistId,
        {
            name,
            description,
        },{new:true}
    )
if(!updatePlaylist){
        throw new ApiError(404,"playlist Not update")
    }
    return res.status(200).json(
        new ApiResponse(200, {
            updatePlaylist: updatePlaylist,        
        }, "playlist update successfully")
    );

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}