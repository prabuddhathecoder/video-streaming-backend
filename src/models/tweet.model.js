import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const tweetSchems=new Schema({
owner:{
        Type:Schema.Types.ObjectId,
        ref:"User",     
    },
    content:{
        type:String,
        required:true
    }

},{timestamps:true})

export const Tweet=mongoose.model("tweet",tweetSchems)