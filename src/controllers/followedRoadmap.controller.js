import { Roadmap } from "../models/roadmap.model.js";
import { FollowedRoadmap } from "../models/followedRoadmap.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const followRoadmap = asyncHandler(async (req, res) => {
    const user = req.user;
    const roadmap = await Roadmap.findById(req.params.id);
    if (!roadmap) {
        throw new ApiError(404, "Roadmap not found");
    }

    if (
        await FollowedRoadmap.findOne({ userId: user._id, roadmapId: roadmap._id })
    ) {
        throw new ApiError(400, "Roadmap already followed");
    }
    const newFollowedRoadmap = await FollowedRoadmap.create({
        userId: user._id,
        roadmapId: roadmap._id,
        completedMilestones: [],
    });

    res.status(200).json(
        new ApiResponse(
            200,
            { followedRoadmap: newFollowedRoadmap },
            "Roadmap followed successfully"
        )
    );
});

export const unfollowRoadmap = asyncHandler (async (req, res) => {
  const roadmap = await Roadmap.findById(req.params.id)
  if (!roadmap) {
    throw new ApiError(404, "Roadmap not found");
  }
  await FollowedRoadmap.findOneAndDelete({userId: req.user._id, roadmapId: req.params.id})
  res.status(200).json(
    new ApiResponse(
      200,
      {},
      "Roadmap unfollowed successfully"
    )
  )
})

export const updateMilestones = asyncHandler(async (req, res) => {
  const {milestoneId, status} = req.body
  const roadmap = await Roadmap.findById(req.params.id)
  if (!roadmap) {
    throw new ApiError (404, "Roadmap not found");
  }
  await FollowedRoadmap.findOneAndUpdate({roadmapId: roadmap._id, userId: req.user._id}, {
    $addToSet: {milestoneStates: {milestoneId, status}}
  })

  res.status(200).json(
    new ApiResponse(
      200,
      {},
      "Milestone status updated"
    )
  )
});