import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"

export const verifyAdmin = asyncHandler(async(req, _, next) => {
    try {
    
        if (!req.user) {
            throw new ApiError(401, "Invalid Access Token");
        }
    
        if (req.user.role !== "admin") {
            throw new ApiError(401, "Unauthorized to perform this action")
        }
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Something went wrong while tying to verify auth token")
    }
})