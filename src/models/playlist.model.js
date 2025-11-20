import mongoose,{Schema, Types} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const plyalistSchema=new Schema({
    name:{
        Type:String,
        required:true,     
    },
    discription:{
        Type:String,
        required:true,     
    },
    video:[
     {
        Type:Schema.Types.ObjectId,
        ref:"Video",     
    },
],
owner:{
        Type:Schema.Types.ObjectId,
        ref:"User",     
    },
},{timestamps:true})

export const Playlist=mongoose.model("Playlist".plyalistSchema)
