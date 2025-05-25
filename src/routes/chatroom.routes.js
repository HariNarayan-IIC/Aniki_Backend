import { Router } from 'express';
import { getAllChatRooms, createChatRoom } from '../controllers/chatroom.controller.js';
import { body } from 'express-validator';



const router = Router();

router.route('/').get(getAllChatRooms);
router.route('/').post(
    body('name').isString().notEmpty(),
    createChatRoom
);


export default router;