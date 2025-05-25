import { Roadmap } from "../models/roadmap.model.js";
import { FollowedRoadmap } from "../models/followedRoadmap.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";


export const getFollowedRoadmap = asyncHandler(async (req, res) => {
  let roadmaps = [];
  const user = req.user;

  roadmaps = await FollowedRoadmap.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(user._id) } },
    {
      $lookup: {
        from: "roadmaps",
        localField: "roadmapId",
        foreignField: "_id",
        as: "roadmap"
      }
    },
    { $unwind: "$roadmap" },
    {
      $addFields: {
        "roadmap.isFollowed": true,
        "roadmap.progress": {
          $cond: [
            { $gt: [{ $size: "$roadmap.nodes" }, 0] },
            {
              $divide: [
                {
                  $size: {
                    $filter: {
                      input: "$milestoneStates",
                      as: "m",
                      cond: { $eq: ["$$m.status", "done"] }
                    }
                  }
                },
                { $size: "$roadmap.nodes" }
              ]
            },
            0
          ]
        }
      }
    },
    {
      $replaceRoot: { newRoot: "$roadmap" }
    },
    {
      $project: {
        nodes: 0,
        edges: 0,
      },
    }
  ]);


  res.json(roadmaps);
});

export const followRoadmap = asyncHandler(async (req, res) => {
  const user = req.user;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const roadmap = await Roadmap.findById(req.params.id).session(session);
    if (!roadmap) {
      throw new ApiError(404, "Roadmap not found");
    }

    const alreadyFollowed = await FollowedRoadmap.findOne({
      userId: user._id,
      roadmapId: roadmap._id,
    }).session(session);

    if (alreadyFollowed) {
      throw new ApiError(400, "Roadmap already followed");
    }

    const newFollowedRoadmap = await FollowedRoadmap.create(
      [
        {
          userId: user._id,
          roadmapId: roadmap._id,
          completedMilestones: [],
        },
      ],
      { session }
    );

    roadmap.followerCount++;
    await roadmap.save({ session, validateBeforeSave: false });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json(
      new ApiResponse(
        200,
        { followedRoadmap: newFollowedRoadmap[0] },
        "Roadmap followed successfully"
      )
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});

export const unfollowRoadmap = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const roadmap = await Roadmap.findById(req.params.id).session(session);
    if (!roadmap) {
      throw new ApiError(404, "Roadmap not found");
    }

    const deletedFollow = await FollowedRoadmap.findOneAndDelete({
      userId: req.user._id,
      roadmapId: req.params.id,
    }).session(session);

    if (!deletedFollow) {
      throw new ApiError(400, "Roadmap not followed by user");
    }

    roadmap.followerCount = Math.max(0, roadmap.followerCount - 1);
    await roadmap.save({ session, validateBeforeSave: false });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json(
      new ApiResponse(200, {}, "Roadmap unfollowed successfully")
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});

export const updateMilestones = asyncHandler(async (req, res) => {
  const { milestoneId, status } = req.body;
  const roadmap = await Roadmap.findById(req.params.id);

  if (!roadmap) {
    throw new ApiError(404, "Roadmap not found");
  }

  const followed = await FollowedRoadmap.findOne({
    roadmapId: roadmap._id,
    userId: req.user._id,
  });

  if (!followed) {
    throw new ApiError(404, "Followed roadmap not found");
  }

  const index = followed.milestoneStates.findIndex(
    (m) => m.milestoneId.toString() === milestoneId
  );

  if (index > -1) {
    // Update existing milestone status
    followed.milestoneStates[index].status = status;
  } else {
    // Add new milestone
    followed.milestoneStates.push({ milestoneId, status });
  }

  await followed.save();

  res.status(200).json(new ApiResponse(200, {}, "Milestone status updated"));
});
