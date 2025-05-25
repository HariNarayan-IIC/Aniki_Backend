import mongoose, { Schema } from "mongoose";

const chatRoomSchema = new Schema({
  name: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['roadmap', 'general'], 
    default: 'general' 
  },
  roadmapId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Roadmap', 
    default: null 
  },
}, { timestamps: true });

export default mongoose.model("ChatRoom", chatRoomSchema)