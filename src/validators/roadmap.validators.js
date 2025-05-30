import { body, param, validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Custom middleware to send validation errors
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const validateRoadmapCreate = [
  body('name').isString().trim().notEmpty().withMessage('Name is required'),
  body('description').isString().trim().notEmpty().withMessage('Description is required'),
  body('nodes').isArray().withMessage('Nodes must be an array'),
  body('nodes.*.id').isString().withMessage('Each node must have a string id'),
  body('nodes.*.data.label').isString().withMessage('Each node must have a label'),
  body('nodes.*.position.x').isNumeric().withMessage('Node position.x must be a number'),
  body('nodes.*.position.y').isNumeric().withMessage('Node position.y must be a number'),
  body('nodes.*.data.description').isString().withMessage('Description is required'),
  body('nodes.*.data.resources.*.resourceLabel').isString().withMessage('Resource label is required'),
  body('nodes.*.data.rosources.*.resourceType').isString().withMessage('Resource type is required'),
  body('nodes.*.data.resources.*.resourceURL').isString().withMessage('Resource URL is required'),
  body('edges').isArray().withMessage('Edges must be an array'),
  body('edges.*.id').isString().withMessage('Each edge must have an id'),
  body('edges.*.source').isString().withMessage('Each edge must have a source'),
  body('edges.*.target').isString().withMessage('Each edge must have a target'),
  validate,
];

export const validateRoadmapUpdate = [
  param('id').custom((value) => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid ID'),
  ...validateRoadmapCreate, // same fields for update
];

export const validateRoadmapId = [
  param('id').custom((value) => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid ID'),
  validate,
];
