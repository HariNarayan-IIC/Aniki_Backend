import { Roadmap } from '../models/roadmap.model.js';
import { ApiError } from '../utils/ApiError.js';

export const getAllRoadmaps = async (req, res, next) => {
  try {
    const roadmaps = await Roadmap.find().select(
      "-nodes -edges"
  );
    res.json(roadmaps);
  } catch (err) {
    next(new ApiError(500, 'Failed to fetch roadmaps', [], err.stack));
  }
};

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

export const deleteRoadmap = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findByIdAndDelete(req.params.id);
    if (!roadmap) {
      throw new ApiError(404, 'Roadmap not found');
    }
    res.json({ message: 'Roadmap deleted' });
  } catch (err) {
    next(new ApiError(500, 'Failed to delete roadmap', [], err.stack));
  }
};
