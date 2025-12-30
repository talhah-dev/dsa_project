import mongoose from "mongoose"

export interface IPatient {
    name: string
    mrn?: string
    phone?: string
    createdAt: Date
    updatedAt: Date
}

const PatientSchema = new mongoose.Schema<IPatient>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        mrn: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
)

const Patient =
    mongoose.models.Patient || mongoose.model<IPatient>("Patient", PatientSchema)

export default Patient
