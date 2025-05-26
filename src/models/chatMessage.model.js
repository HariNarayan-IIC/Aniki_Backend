import { Schema, model } from "mongoose";

const chatMessageSchema = new Schema({
    roomId: { 
        type: Schema.Types.ObjectId, 
        ref: "ChatRoom", 
        required: true 
    },
    username: {
        type: String,
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
    upvotes: {
        type: Number,
        default: 0
    },
    replied_to: {
        type: Schema.Types.ObjectId,
        ref: "ChatMessage",
        default: null
    }
}, { timestamps: true });

export default model("ChatMessage", chatMessageSchema);
