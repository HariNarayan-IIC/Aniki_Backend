import { Router } from 'express';
import {
  getAllRoadmaps,
  getRoadmapById,
  createRoadmap,
  updateRoadmap,
  deleteRoadmap,
} from '../controllers/roadmap.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { verifyAdmin } from '../middlewares/admin.middleware.js';
import {
  validateRoadmapCreate,
  validateRoadmapUpdate,
  validateRoadmapId,
} from '../validators/roadmap.validators.js';

const router = Router();

router.route('/').get(getAllRoadmaps);
router.route('/:id').get(validateRoadmapId, getRoadmapById);
router.route('/').post(verifyJWT, verifyAdmin, validateRoadmapCreate, createRoadmap);
router.route('/:id').put(verifyJWT, verifyAdmin, validateRoadmapUpdate, updateRoadmap);
router.route('/:id').delete(verifyJWT, verifyAdmin, validateRoadmapId, deleteRoadmap);

export default router;
