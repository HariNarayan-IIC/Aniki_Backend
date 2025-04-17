import mongoose, { Model, Schema } from "mongoose";

const otpSchema = new Schema({}, {})


export const OTP = mongoose.model("OTP", otpSchema) 