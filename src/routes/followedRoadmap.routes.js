import { Router } from "express";
import { followRoadmap, unfollowRoadmap } from "../controllers/followedRoadmap.controller.js";
import { validateRoadmapId } from "../validators/roadmap.validators.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { body } from "express-validator";
import { updateMilestones } from "../controllers/followedRoadmap.controller.js"

const router = Router();

router.route("/:id").post(verifyJWT, validateRoadmapId, followRoadmap);
router.route("/:id").delete(verifyJWT, validateRoadmapId, unfollowRoadmap);
router.route("/:id").put(
    verifyJWT,
    validateRoadmapId,
    body('milestoneId')
        .custom((value) => mongoose.Types.ObjectId.isValid(value))
        .withMessage('Invalid milestoneId'),
    body('status')
        .isIn(['inProgress', 'pending', 'skipped', 'done'])
        .withMessage('Invalid status value'),
    updateMilestones
);


export default router;