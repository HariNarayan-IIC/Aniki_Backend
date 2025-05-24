import { Roadmap } from "../models/roadmap.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const buildRoadmapPipeline = (userId, matchId = null) => {
    const pipeline = [];

    // Optional match for a specific roadmap
    if (matchId) {
        pipeline.push({
            $match: { _id: new mongoose.Types.ObjectId(matchId) },
        });
    }

    pipeline.push(
        {
            $lookup: {
                from: "followedroadmaps",
                localField: "_id",
                foreignField: "roadmapId",
                as: "followers",
            },
        },
        {
            $addFields: {
                followerCount: { $size: "$followers" },
                isFollowed: {
                    $gt: [
                        {
                            $size: {
                                $filter: {
                                    input: "$followers",
                                    as: "f",
                                    cond: { $eq: ["$$f.userId", userId] },
                                },
                            },
                        },
                        0,
                    ],
                },
                userFollowDoc: {
                    $first: {
                        $filter: {
                            input: "$followers",
                            as: "f",
                            cond: { $eq: ["$$f.userId", userId] },
                        },
                    },
                },
            },
        },
        {
            $addFields: {
                progress: {
                    $let: {
                        vars: {
                            matchedMilestones: {
                                $filter: {
                                    input: {
                                        $ifNull: [
                                            "$userFollowDoc.milestoneStates",
                                            [],
                                        ],
                                    },
                                    as: "ms",
                                    cond: { $eq: ["$$ms.status", "done"] },
                                },
                            },
                        },
                        in: {
                            $cond: [
                                { $gt: [{ $size: "$nodes" }, 0] },
                                {
                                    $divide: [
                                        { $size: "$$matchedMilestones" },
                                        { $size: "$nodes" },
                                    ],
                                },
                                0,
                            ],
                        },
                    },
                },
            },
        }
    );

    if (matchId) {
        // Add status to each node
        pipeline.push(
            {
                $addFields: {
                    nodes: {
                        $map: {
                            input: "$nodes",
                            as: "node",
                            in: {
                                $mergeObjects: [
                                    "$$node",
                                    {
                                        status: {
                                            $let: {
                                                vars: {
                                                    matchedState: {
                                                        $first: {
                                                            $filter: {
                                                                input: {
                                                                    $ifNull: [
                                                                        "$userFollowDoc.milestoneStates",
                                                                        [],
                                                                    ],
                                                                },
                                                                as: "ms",
                                                                cond: {
                                                                    $eq: [
                                                                        "$$ms.milestoneId",
                                                                        "$$node._id",
                                                                    ],
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                                in: {
                                                    $ifNull: [
                                                        "$$matchedState.status",
                                                        "pending",
                                                    ],
                                                },
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    followers: 0,
                    userFollowDoc: 0,
                },
            }
        );
    } else {
        pipeline.push({
            $project: {
                followers: 0,
                userFollowDoc: 0,
                nodes: 0,
                edges: 0,
            },
        });
    }

    return pipeline;
};



export const getAllRoadmaps = asyncHandler(async (req, res) => {
    let roadmaps = [];
    const user = req.user;
    if (!user) {
        roadmaps = await Roadmap.find().select("-nodes -edges");
        roadmaps = roadmaps.map((roadmap) => ({
            ...roadmap.toObject(),
            isFollowed: false,
        }));
    } else {
        const pipeline = buildRoadmapPipeline(user._id);
        roadmaps = await Roadmap.aggregate(pipeline);
    }
    res.json(roadmaps);
});

export const getRoadmapById = asyncHandler (async (req, res) => {
    let roadmap;
    if (req.user){
        const pipeline = buildRoadmapPipeline(req.user._id, req.params.id);
        const result = await Roadmap.aggregate(pipeline);
        if (result.length > 0) {
            roadmap = result[0]
        }
    }
    else {
        roadmap = await Roadmap.findById(req.params.id);
        roadmap = roadmap.toObject()
        roadmap.isFollowed = false;
        roadmap.nodes = roadmap.nodes.map((node) => ({
            ...node,
            status: "pending",
        }));
    }
    if (!roadmap) {
        throw new ApiError(404, "Roadmap not found");
    }
    res.json(roadmap);
});

export const createRoadmap = async (req, res, next) => {
    try {
        const { name, description, nodes, edges } = req.body;
        const roadmap = new Roadmap({ name, description, nodes, edges });
        await roadmap.save();
        res.status(201).json(roadmap);
    } catch (err) {
        console.log(err)
        next(new ApiError(400, "Failed to create roadmap", [], err.stack));
    }
};

export const updateRoadmap = async (req, res, next) => {
    try {
        const roadmap = await Roadmap.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );
        if (!roadmap) {
            throw new ApiError(404, "Roadmap not found");
        }
        res.json(roadmap);
    } catch (err) {
        next(new ApiError(400, "Failed to update roadmap", [], err.stack));
    }
};

export const deleteRoadmap = asyncHandler(async (req, res) => {
    const roadmap = await Roadmap.findByIdAndDelete(req.params.id);
    if (!roadmap) {
        throw new ApiError(404, "Roadmap not found");
    }
    res.json({ message: "Roadmap deleted" });
});

