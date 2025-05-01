import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import errorHandler from "./middlewares/errorHandler.middleware.js"
import logger from "./middlewares/logger.middleware.js"

const app = express()

//setup middlewares
const allowedOrigins = [
    "https://aniki-frontend.netlify.app",
    "http://localhost:5173", // if you want local frontend too
  ];
app.use(cors({
    origin: function(origin, callback) {
        // allow requests with no origin (like mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new ApiError(400, msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],  // explicitly allow methods
    allowedHeaders: ['Content-Type', 'Authorization'],    // explicitly allow headers
}));
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())
app.use(logger)

//Dummy route for testing
app.get("/", (req, res) => {
    return res.status(200).send("<h1>Welcome to Aniki</h1>")
})


//routes import 
import userRouter from './routes/user.routes.js';
import roadmapRouter from './routes/roadmap.routes.js';
import { ApiError } from "./utils/ApiError.js";


//routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/roadmap", roadmapRouter);


//error middleware must be placed after routes (Order of app.use matters)
app.use(errorHandler);

export { app }