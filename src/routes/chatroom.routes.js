import { Router } from 'express';
import { getAllChatRooms, createChatRoom, getAllMessages } from '../controllers/chatroom.controller.js';
import { body } from 'express-validator';



const router = Router();

router.route('/').get(getAllChatRooms);
router.route('/').post(
    body('name').isString().notEmpty(),
    createChatRoom
);
router.route('/:roomId').get(getAllMessages);


export default router;