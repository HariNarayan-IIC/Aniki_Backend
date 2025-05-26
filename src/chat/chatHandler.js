import ChatMessage from "../models/chatMessage.model.js";

export default function chatHandler(io, socket) {
    socket.on("joinRoom", ({roomId}) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`)
    });

    socket.on("chatMessage", async({roomId, message}) => {
        try {
            const userId = socket.user._id;
            const username = socket.user.username;

            const chatMsg = new ChatMessage({
                roomId,
                userId,
                message,
                username
            })

            await chatMsg.save();

            io.to(roomId).emit("chatMessage", {
                username,
                message,
                timestamp: chatMsg.createdAt,
            });
        } catch (err) {
            console.error("Chat error", err.message)
        }

    });


}