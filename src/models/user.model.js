import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";

const followingRoadmapSchema = new Schema({
    roadmapId: {
        type: Schema.Types.ObjectId,
        ref: "Roadmap"
    },
    completedMilestones: [
        {
            type: Schema.Types.ObjectId,
            ref: "Milestone"
        }
    ]
}, {timestamps: true})

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String, //Hashed password
        required: true
    },
    role: {
        type: String,
        enum: ["explorer", "admin"],
        default: "explorer"
    },
    profile_picture: String, //Cloudinary URL
    streak: {
        type: Number,
        default: 0
    },
    highestStreak: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ["Active", "Inactive", "Deleted", "Banned"],
        default: "Active"
    },
    followingRoadmaps: {
        type: [followingRoadmapSchema]
    }
}, {timestamps: true})

userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    
    this.password = bcrypt.hash(this.password, 10)
    next()
})

export const User = mongoose.model("User", userSchema)