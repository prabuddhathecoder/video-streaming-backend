import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        index: true,
        trim: true,
    },
    avatar: {
        type: String,
        required: true,
    },
    coverImg: {
        type: String,
    },
    watchHistory: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    password: {
        type: String,
        required: [true, "Password is Required"]
    },
    refreshToken: {
        type: String,
    },
}, { timestamps: true });

// Password hashing middleware
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    
    this.password = await bcrypt.hash(this.password, 10);
    // console.log(`after hashing pass: ${this.password}`)
    next();
    
});

// Password comparison method
userSchema.methods.isPasswordCorrect = async function (password) {
    
    try {

        return await bcrypt.compare(password, this.password);
    } catch (error) {
        throw new Error("Password comparison failed");
    }
};

// Access token generation
userSchema.methods.generateAccessToken = function () {

   try {
     return jwt.sign(
         {
             _id: this._id,
             email: this.email,
             userName: this.userName,
             fullName: this.fullName
         },
         process.env.ACCESS_TOKEN_SECRET,
         {
             expiresIn: process.env.ACCESS_TOKEN_EXPIRY
         }
     );
   } catch (error) {
    console.log(`error in accesstoken`,error)
    
   }
};

// Refresh token generation (CORRECTED)
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET, // Use refresh token secret
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY // Use refresh token expiry
        }
    );
};

export const User = mongoose.model('User', userSchema);