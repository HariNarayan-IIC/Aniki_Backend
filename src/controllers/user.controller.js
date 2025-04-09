import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";


const registerUser = asyncHandler( async (req, res) => {
    //Get user details
    console.log(req.body)
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

export {registerUser}