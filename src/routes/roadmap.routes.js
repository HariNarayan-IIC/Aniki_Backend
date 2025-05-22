import { Router } from 'express';
import {
  getAllRoadmaps,
  getRoadmapById,
  createRoadmap,
  updateRoadmap,
  deleteRoadmap,
  followRoadmap
} from '../controllers/roadmap.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { verifyAdmin } from '../middlewares/admin.middleware.js';
import { verifyUser } from '../middlewares/user.middleware.js';
import {
  validateRoadmapCreate,
  validateRoadmapUpdate,
  validateRoadmapId,
} from '../validators/roadmap.validators.js';

const router = Router();

router.route('/').get(verifyUser, getAllRoadmaps);
router.route('/:id').get(verifyUser, validateRoadmapId, getRoadmapById);
router.route('/').post(verifyJWT, verifyAdmin, validateRoadmapCreate, createRoadmap);
router.route('/:id').put(verifyJWT, verifyAdmin, validateRoadmapUpdate, updateRoadmap);
router.route('/:id').delete(verifyJWT, verifyAdmin, validateRoadmapId, deleteRoadmap);
router.route('/:id/follow').post(verifyJWT, validateRoadmapId, followRoadmap);

export default router;
