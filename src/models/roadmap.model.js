import mongoose, { Schema } from "mongoose";

const roadmapSchema = new Schema({
    
},{timestamps: true});

export const Roadmap = mongoose.model("Roadmap", roadmapSchema);