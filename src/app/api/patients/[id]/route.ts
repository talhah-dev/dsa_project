import { DB } from "@/lib/db"
import Patient from "@/models/Patient"
import { NextRequest, NextResponse } from "next/server"

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_: NextRequest, context: Ctx) {
    try {
        await DB()
        const { id } = await context.params

        const patient = await Patient.findById(id)
        if (!patient) return NextResponse.json({ message: "Patient not found" }, { status: 404 })
        return NextResponse.json({ patient })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ message: "Failed to fetch patient" }, { status: 500 })
    }
}

export async function PATCH(req: NextRequest, context: Ctx) {
    try {
        await DB()
        const { id } = await context.params
        const body = await req.json()

        const patient = await Patient.findByIdAndUpdate(id, body, { new: true })
        if (!patient) return NextResponse.json({ message: "Patient not found" }, { status: 404 })

        return NextResponse.json({ patient })
    } catch (error: any) {
        console.log(error)
        const msg = error?.code === 11000 ? "MRN already exists" : "Failed to update patient"
        return NextResponse.json({ message: msg }, { status: 500 })
    }
}
