import ChatRoom from "../models/chatRoom.model.js";
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