import mongoose, { Schema, models } from "mongoose";

const serviceSchema = new Schema(
    {
        image: { type: String, required: false },
        title: { type: String, required: true },
        desc: { type: String, required: true },
        order: { type: Number, required: true, default: 0 },
    },
    { timestamps: true }
);

const Service = models.Service || mongoose.model("Service", serviceSchema);
export default Service;