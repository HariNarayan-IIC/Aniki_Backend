import mongoose, {Schema} from "mongoose";

const userRoadmapSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    roadmapId: {
        type: Schema.Types.ObjectId,
        ref: "Roadmap",
        required: true
    },
    completedMilestones: [
        {
            type: Schema.Types.ObjectId,
            ref: "Milestone"
        }
    ]
}, {timestamps: true})


export const UserRoadmap = mongoose.model("UserRoadmap", userRoadmapSchema)