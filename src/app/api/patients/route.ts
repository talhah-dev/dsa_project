import { DB } from "@/lib/db"
import Patient from "@/models/Patient"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
    try {
        await DB()

        const { searchParams } = new URL(req.url)
        const q = searchParams.get("q")?.trim()

        const filter: any = {}
        if (q) {
            filter.$or = [
                { name: { $regex: q, $options: "i" } },
                { mrn: { $regex: q, $options: "i" } },
                { phone: { $regex: q, $options: "i" } },
            ]
        }

        const patients = await Patient.find(filter).sort({ createdAt: -1 })
        return NextResponse.json({ patients })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ message: "Failed to fetch patients" }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        await DB()
        const body = await req.json()

        const { name, mrn, phone } = body
        if (!name) return NextResponse.json({ message: "name is required" }, { status: 400 })

        const patient = await Patient.create({ name, mrn, phone })
        return NextResponse.json({ patient }, { status: 201 })
    } catch (error: any) {
        console.log(error)
        const msg = error?.code === 11000 ? "MRN already exists" : "Failed to create patient"
        return NextResponse.json({ message: msg }, { status: 500 })
    }
}
