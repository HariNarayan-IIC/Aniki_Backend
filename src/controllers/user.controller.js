import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import { sendHtmlMail } from "../utils/mailer.js";
import { OTP } from "../models/otp.model.js";


const isProduction = process.env.NODE_ENV === "production"
console.log(`isProduction: ${isProduction}`)
const options = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax"  // <-- use "lax" for development
};

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}


const isUsernameAvailable= async (username) => {

    const user = await User.findOne({ username: { $regex: `^${username}$`, $options: 'i' } })
    if (user) {
        throw new ApiError(400, "Username already in use")
    }
}

const isEmailAvailable= async (email) => {
    const user = await User.findOne({email})
    if (user) {
        throw new ApiError(400, "Email already in use")
    }
}

const registerUser = asyncHandler( async (req, res) => {
    const result = validationResult(req)
    if (!result.isEmpty()){
        //console.log("\n inside validation failded block \n")
        //console.log(result.array())
        throw new ApiError(400, "Invalid input data", result.array());
    }
    //Get user details
    const {fullName, email, username, password} = req.body

    //validation - not empty
    if ([fullName, email, username, password].some((field) => field?.trim()==="")){
        throw new ApiError(400, "Field cannot be empty");
    }

    //check if already exists: username, email
    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    //Verify email using otp
    //Save user detail in db
    const user = await User.create({
        fullName: fullName,
        username: username,
        email: email,
        password: password
    })

    //check for user creation
    //remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError (500, "Something went wrong while registering the user")
    }
    
    //return res
    return res.status(200).json(
        new ApiResponse(200, createdUser, "User Registered successfully")
    )
})

const loginUser = asyncHandler(async (req, res) => {
    // Extract data from request
    const {email, username, password} = req.body

    if (!(username || email)) {
        throw new ApiError (400, "username or email is required")
    }

    // Find user in db
    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    // If user not in db return Error
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Password check
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Incorrect password");
    }

    // Send access and refresh token in response cookie
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")


    res
    .status(200)
    .cookie("accessToken" ,accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(
        200, 
        {user: loggedInUser, accessToken, refreshToken}, 
        "Loggin successful"
    ))
})

const logoutUser = asyncHandler(async (req, res) => {
    //Find user and update the refresh token value to undefined
    await User.findByIdAndUpdate(
        req.user._id,
        {$set: {refreshToken: ""}},
        {new: true}
    )


    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200,{},"Logout successful"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {

    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

        if (!incomingRefreshToken || incomingRefreshToken=="") {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError( 401, "Refresh token is expired or used")
        }
    

        const accessToken = await user.generateAccessToken()
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .json(new ApiResponse(200,{accessToken},"Successfully refreshed access token"))
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
        
    }

})

const verifyEmail = asyncHandler(async (req, res) => {

    const {email} = req.body

    //find user by email
    const user = await User.findOne({email})

    if (!user) {
        throw new ApiError(404, "No user found with given Email");
    }

    //generate OTP
    const otp =  Math.floor(Math.random() * (9999 - 1000) + 1000);
    console.log("Otp: ", otp);

    //save OTP
    await OTP.create({
        user_id: user._id,
        otp
    })

    //send OTP via mail
    await sendHtmlMail({
        to: email,
        subject: "Verify your email to complete registration",
        htmlFilePath: 'otpMail.html',
        variables: {
            fullName: user.fullName,
            otp
        }
    })

    //send response
    res
    .status(200)
    .json(new ApiResponse(
        200, 
        {}, 
        "OTP sent to email successfully"
    ))
})

const validateOTP = asyncHandler(async (req, res) => {
    //get otp and email
    const {otp, email} = req.body

    //find user with email
    const user = await User.findOne({email})
    if (!user) {
        throw new ApiError(400, "Invalid email")
    }

    //find otp using user._id
    const otpInDB= await OTP.findOne({user_id: user._id})
    if (!otpInDB){
        throw new ApiError(404, "OTP expired")
    }

    //compare otp
    if (otp != otpInDB.otp) {
        throw new ApiError(400, "Incorrect OTP")
    }
    //update user isEmailVerified to true
    user.isEmailVerified= true
    await user.save({validateBeforeSave: false})

    // Send access and refresh token in response cookie
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")



    res
    .status(200)
    .cookie("accessToken" ,accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(
        200, 
        {user: loggedInUser, accessToken, refreshToken}, 
        "Loggin successful"
    ))

})
export {registerUser, loginUser, logoutUser, refreshAccessToken, isUsernameAvailable, isEmailAvailable, verifyEmail, validateOTP}