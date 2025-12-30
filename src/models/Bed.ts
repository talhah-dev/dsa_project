import mongoose from "mongoose"

export interface IBed {
    code: string
    ward: string
    status: "active" | "inactive"
    createdAt: Date
    updatedAt: Date
}

const BedSchema = new mongoose.Schema<IBed>(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        ward: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
    },
    { timestamps: true }
)

const Bed = mongoose.models.Bed || mongoose.model<IBed>("Bed", BedSchema)

export default Bed
