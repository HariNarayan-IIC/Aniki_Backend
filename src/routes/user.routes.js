import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken, isUsernameAvailable, isEmailAvailable, verifyEmail, validateOTP, signUpWithGoogle } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { body, checkExact } from "express-validator";
import { ApiResponse } from "../utils/ApiResponse.js";

const router = Router()

router.route("/register").post(

    body('*')
        .trim().notEmpty().withMessage("Field cannot be empty"),

    body('email').isEmail()
        .custom(isEmailAvailable),

    body('fullName')
        .isLength({min: 2}).withMessage("fullName should be atleast 2 char long")
        .matches(/^[\p{L} .'-]+$/u),

    body('password')
        .isStrongPassword().withMessage("Weak password"),

    checkExact([]),

    registerUser
)
router.route("/login").post(
    body('email').isEmail(),
    loginUser
)
router.route("/refreshAccessToken").post(refreshAccessToken)
router.route("/verify-email").post(
    body('email').isEmail(),
    verifyEmail
)
router.route("/validate-otp").post(
    body('email').isEmail(),
    body('otp').isLength({min: 4, max: 4}).withMessage("otp must be 4 digit long"),
    validateOTP
)
//Forgot password
//signup with Google
router.route("/signin-with-google").post(
    body('credentialToken').isString().notEmpty(),
    signUpWithGoogle
)

//secured routes
router.route("/me").post(verifyJWT,(req, res)=> {
    return res
        .status(200)
        .json(new ApiResponse(200,{user: req.user},"User verification successful"))
    }
)
router.route("/logout").post(verifyJWT, logoutUser)
//Update User profile

export default router