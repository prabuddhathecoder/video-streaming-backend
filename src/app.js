import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"


const app=express()

app.use(cors(
    { 
      Credential:true,
      origin:process.env.CROS_ORIGIN
    }
))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({
    limit:"16kb",
    extended:true
}))

app.use(express.static("public"))
app.use(cookieParser())



// routes import

import userRouter from "../src/routes/user.routers.js"
import videoRouter from "../src/routes/video.routes.js"
import commentRouter from "../src/routes/comment.routers.js"
import likeRouter from "../src/routes/like.routers.js"
import tweetRouter from "../src/routes/tweet.router.js"
import playlist from "../src/routes/playlist.routes.js"

//routes  declearation

app.use("/api/v1/user",userRouter)
app.use("/api/v1/video",videoRouter)
app.use("/api/v1/comment",commentRouter)
app.use("/api/v1/like",likeRouter)
app.use("/api/v1/tweet",tweetRouter)
app.use("/api/v1/playlist",playlist)


export  { app };