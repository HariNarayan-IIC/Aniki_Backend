import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken, isUsernameAvailable, isEmailAvailable } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { body, checkExact } from "express-validator";

const router = Router()

router.route("/register").post(

    body('*')
        .trim().notEmpty().withMessage("Field cannot be empty"),

    body('fullName')
        .isLength({min: 2}).withMessage("fullName should be atleast 2 char long")
        .matches(/^[\p{L} .'-]+$/u),

    body('username')
        .isLength({min: 6}).withMessage("Username must be atleast 6 digit long")
        .custom(isUsernameAvailable)
        .matches(/^[a-zA-Z0-9_@]*$/).withMessage("Username can only contain A-Z, a-z , 0-9, _, @"),

    body('email').isEmail()
        .custom(isEmailAvailable),

    body('password')
        .isStrongPassword().withMessage("Weak password"),

    checkExact([]),

    registerUser
)
router.route("/login").post(loginUser)
router.route("/refreshAccessToken").post(refreshAccessToken)
//router.route("/verify-email").post()

//secured routes
router.route("/logout").post(verifyJWT, logoutUser)


export default router