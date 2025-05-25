import { Schema, model } from "mongoose";

const chatMessageSchema = new Schema({
    roomId: { 
        type: Schema.Types.ObjectId, 
        ref: "ChatRoom", 
        required: true 
    },
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    message: { 
        type: String, 
        required: true 
    },
}, { timestamps: true });

export default model("ChatMessage", chatMessageSchema);
