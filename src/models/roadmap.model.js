import mongoose, { Schema } from 'mongoose';

const nodeSchema = new Schema({
  id: { type: String, required: true },
  data: {
    label: { type: String, required: true },
  },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  style: { type: Object }, // optional styling info
  description: {type: String},
  resources: [{
    resourceLabel: {type: String, required: true},
    resourceType: {type: String, enum: ["Blog", "Article", "Book", "Video", "Paper", "Course"], required: true},
    resourceURL: {type: String, required: true }
  }]
});

const edgeSchema = new Schema({
  id: { type: String, required: true },
  source: { type: String, required: true },
  target: { type: String, required: true },
  label: { type: String },
  animated: { type: Boolean },
  style: { type: Object },
});

const roadmapSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    nodes: [nodeSchema],
    edges: [edgeSchema],
  },
  { timestamps: true }
);

export const Roadmap = mongoose.model('Roadmap', roadmapSchema);
