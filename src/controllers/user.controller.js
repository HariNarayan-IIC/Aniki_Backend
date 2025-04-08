import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js";


const registerUser = asyncHandler( async (req, res) => {
    //Get user details
    const {fullname, email, username, password} = req.body
    //validation - not empty
    if (!(fullname?.trim() == "" || email?.trim() == "" || username?.trim() == "" || password?.trim() == "")){
        throw new ApiError(400, "Field cannot be empty");
    }
    //check if already exists: username, email
    //Verify email using otp
    //Save user detail in db
    //remove password and refresh token field from response
    //check for user creation
    //return res
    return res.status(200).json(
        new ApiResponse(200, "", "User Registered successfully")
    )
})

export {registerUser}