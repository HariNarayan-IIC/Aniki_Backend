import { Roadmap } from '../models/roadmap.model.js';
import { UserRoadmap } from '../models/userRoadmap.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getAllRoadmaps = asyncHandler(async (req, res, next) => {
  const roadmaps = await Roadmap.find().select(
      "-nodes -edges"
  );
    
    res.json(roadmaps);

});

export const getRoadmapById = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);
    if (!roadmap) {
      throw new ApiError(404, 'Roadmap not found');
    }
    res.json(roadmap);
  } catch (err) {
    next(err instanceof ApiError ? err : new ApiError(500, 'Failed to get roadmap', [], err.stack));
  }
};

export const createRoadmap = async (req, res, next) => {
  try {
    const { name, description, nodes, edges } = req.body;
    const roadmap = new Roadmap({ name, description, nodes, edges });
    await roadmap.save();
    res.status(201).json(roadmap);
  } catch (err) {
    next(new ApiError(400, 'Failed to create roadmap', [], err.stack));
  }
};

export const updateRoadmap = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!roadmap) {
      throw new ApiError(404, 'Roadmap not found');
    }
    res.json(roadmap);
  } catch (err) {
    next(new ApiError(400, 'Failed to update roadmap', [], err.stack));
  }
};

export const deleteRoadmap = asyncHandler (async (req, res) => {
    const roadmap = await Roadmap.findByIdAndDelete(req.params.id);
    if (!roadmap) {
      throw new ApiError(404, 'Roadmap not found');
    }
    res.json({ message: 'Roadmap deleted' });
});

export const followRoadmap = asyncHandler (async (req, res) => {
    const user = req.user
    const roadmap = await Roadmap.findById(req.params.id);
    if (!roadmap) {
      throw new ApiError(404, "Roadmap not found");
    }

    if (await UserRoadmap.findOne({userId: user._id, roadmapId: roadmap._id})) {
      throw new ApiError(400, "UserRoadmap already exists");
    }
    const newUserRoadmap = await UserRoadmap.create({
      userId: user._id,
      roadmapId: roadmap._id,
      completedMilestones: []
    })
    
    res.status(200).json(
      new ApiResponse(
        200,
        {userRoadmap: newUserRoadmap},
        "Roadmap followed successfully"
      )
    )
  }
)
