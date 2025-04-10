import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";


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

const registerUser = asyncHandler( async (req, res) => {
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

    const options = {
        httpOnly: true,
        secure: true
    }

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

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200,{},"Logout successful"))
})

export {registerUser, loginUser, logoutUser}