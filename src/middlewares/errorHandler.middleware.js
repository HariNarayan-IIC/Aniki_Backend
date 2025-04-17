// middlewares/errorHandler.js
import { ApiError } from "../utils/ApiError.js";


const errorHandler = (err, req, res, next) => {


    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
                "statusCode": err.statusCode,
                "error": err.errors || [],
                "message": err.message,
                "success": false
        });
    }


    console.error(err); // for dev logging

    return res.status(500).json({
        "statusCode": 500,
        "error": [],
        "message": "Internal server error",
        "success": false
    });
};

export default errorHandler;
