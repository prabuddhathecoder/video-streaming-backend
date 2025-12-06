
import { Router } from 'express';
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishVideo,
    togglePublishStatus,
    updateVideo,
    getUserVideos
} from "../controllers/video.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js" // Fixed spelling
import { upload } from "../middlewares/multer.middleware.js";


const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
    .route("/")
    .get(getAllVideos)
    .post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
            
        ]),
        publishVideo
    );

router
    .route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(updateVideo);

router.route("/publish/:videoId").patch(togglePublishStatus);
router.route("/video/user/:userId").get(getAllVideos);

export default router
