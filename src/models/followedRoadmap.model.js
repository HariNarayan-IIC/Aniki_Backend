import mongoose, {Schema} from "mongoose";


const followedRoadmapSchema = new Schema({
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
  milestoneStates: [
    {
      milestoneId: {
        type: Schema.Types.ObjectId,
        required: true
      },
      status: {
        type: String,
        enum: ["pending", "inProgress", "done", "skipped"],
        default: "pending"
      }
    }
  ]
}, { timestamps: true });

followedRoadmapSchema.index({ userId: 1, roadmapId: 1 }, { unique: true });



export const FollowedRoadmap = mongoose.model("FollowedRoadmap", followedRoadmapSchema)