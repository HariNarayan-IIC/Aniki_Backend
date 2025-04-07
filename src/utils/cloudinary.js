import {v2 as cloudinary} from "cloudinary";
import fs from "fs"



// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //Upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //File has been uploaded
        console.log("File has been uploaded successfully!!", response.url)
        return response
    } catch (error) {
        fs.unlinkSync(lacalFilePath) //Remove the locally saved temporary file as the upload operation failed
        return null;
    }

}

export {uploadOnCloudinary}