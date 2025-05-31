import ChatRoom from "../models/chatRoom.model.js";
import ChatMessage from "../models/chatMessage.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAllChatRooms = asyncHandler(async (req, res) => {
    let chatRooms = [];
    chatRooms = await ChatRoom.find();
    res.status(200).json(
        new ApiResponse(
            200,
            chatRooms,
            "Fetched all chatRooms successfully"
        )
    );
});

export const createChatRoom = asyncHandler( async(req, res) => {

    const { name } = req.body
    const chatRoom = await ChatRoom.create({
        name,
    }
    );

    res.status(200).json(
        new ApiResponse(
            200,
            {chatRoom},
            "Created new chat room successfully"
        )
    )
});

export const getAllMessages = asyncHandler(async (req, res) => {
    const rawMessages = await ChatMessage.find({ roomId: req.params.roomId })
        .sort({ createdAt: -1 }) // get latest messages
        .limit(100)
        .lean(); // improves performance if you don't need Mongoose docs

    const messages = rawMessages.reverse(); // now oldest -> newest

    res.status(200).json(
        new ApiResponse(
            200,
            messages,
            "Fetched last 100 messages in correct order"
        )
    );
});
