import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {registerUser ,loginUser, logoutUser, refreshAccessToken,currentPasswordChange,getcurrentUser
    ,updateAccountInfo, getUserChannelProfile,
    getWatchHistory, 
    updateAvatar,
    updateCoverImg
    
}from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js";
import { uploadFile } from "../utils/fileUploder.js";
const router=Router()

router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImg", maxCount: 1 }
    ]),
    registerUser
);
router.route("/login").post(loginUser);

// secure route
router.route("/logout").post(verifyJWT,logoutUser);

router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT,currentPasswordChange);
router.route("/current-user").get( verifyJWT,getcurrentUser);

router.route("/update-account").patch( verifyJWT,updateAccountInfo);

router.route("/avatar").patch( verifyJWT,upload.single("avatar"
),updateAvatar);
router.route("/cover-image").patch( verifyJWT,upload.single("coverImg"
),updateCoverImg );
router.route("/watch-History").get( verifyJWT,getWatchHistory );
router.route("/c/:userName").get( verifyJWT,getUserChannelProfile );




export default router