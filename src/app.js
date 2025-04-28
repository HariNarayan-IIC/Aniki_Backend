import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import errorHandler from "./middlewares/errorHandler.middleware.js"
import logger from "./middlewares/logger.middleware.js"

const app = express()

//setup middlewares
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())
app.use(logger)

//Dummy route for testing
app.get("/", (req, res) => {
    return res.status(200).json({
        "Salutation": "Hello World"
    })
})


//routes import 
import userRouter from './routes/user.routes.js';


//routes declaration
app.use("/api/v1/users", userRouter)


//error middleware must be placed after routes (Order of app.use matters)
app.use(errorHandler);

export { app }