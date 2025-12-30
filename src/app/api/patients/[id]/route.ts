import { DB } from "@/lib/db"
import Patient from "@/models/Patient"
import { NextRequest, NextResponse } from "next/server"

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
    try {
        await DB()
        const patient = await Patient.findById(params.id)
        if (!patient) return NextResponse.json({ message: "Patient not found" }, { status: 404 })
        return NextResponse.json({ patient })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ message: "Failed to fetch patient" }, { status: 500 })
    }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await DB()
        const body = await req.json()

        const patient = await Patient.findByIdAndUpdate(params.id, body, { new: true })
        if (!patient) return NextResponse.json({ message: "Patient not found" }, { status: 404 })

        return NextResponse.json({ patient })
    } catch (error: any) {
        console.log(error)
        const msg = error?.code === 11000 ? "MRN already exists" : "Failed to update patient"
        return NextResponse.json({ message: msg }, { status: 500 })
    }
}
