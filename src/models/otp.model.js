import mongoose, { Model, Schema } from "mongoose";

const otpSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    otp: {
        type: Number,
        required: true
    }
}, {timestamps: true})

otpSchema.index({createAt: 1}, {expireAfterSeconds: 10 * 60}) //Otp documents expires after 10 minutes

export const OTP = mongoose.model("OTP", otpSchema) 