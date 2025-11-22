import mongoose,{Schema, Types} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const plyalistSchema=new Schema({
    name:{
        type:String,
        required:true,     
    },
    description:{
        type:String,
        required:true,     
    },
    video:[
     {
        type:Schema.Types.ObjectId,
        ref:"Video",     
    },
],
owner:{
        type:Schema.Types.ObjectId,
        ref:"User",     
    },
},{timestamps:true})

export const Playlist=mongoose.model("Playlist",plyalistSchema)
