import mongoose from "mongoose"

export interface IStay {
    bedId: mongoose.Types.ObjectId
    patientId: mongoose.Types.ObjectId
    start: Date
    end: Date
    status: "reserved" | "admitted" | "discharged" | "cancelled"
    createdAt: Date
    updatedAt: Date
}

const StaySchema = new mongoose.Schema<IStay>(
    {
        bedId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bed",
            required: true,
            index: true,
        },
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
        },
        start: {
            type: Date,
            required: true,
            index: true,
        },
        end: {
            type: Date,
            required: true,
            index: true,
        },
        status: {
            type: String,
            enum: ["reserved", "admitted", "discharged", "cancelled"],
            default: "reserved",
        },
    },
    { timestamps: true }
)

const Stay = mongoose.models.Stay || mongoose.model<IStay>("Stay", StaySchema)

export default Stay
