import { DB } from "@/lib/db"
import Bed from "@/models/Bed"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
    try {
        await DB()

        const { searchParams } = new URL(req.url)
        const ward = searchParams.get("ward")
        const status = searchParams.get("status")

        const filter: any = {}
        if (ward) filter.ward = ward
        if (status) filter.status = status

        const beds = await Bed.find(filter).sort({ createdAt: -1 })
        return NextResponse.json({ beds })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ message: "Failed to fetch beds" }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        await DB()
        const body = await req.json()

        const { code, ward, status } = body
        if (!code || !ward) {
            return NextResponse.json({ message: "code and ward are required" }, { status: 400 })
        }

        const bed = await Bed.create({ code, ward, status })
        return NextResponse.json({ bed }, { status: 201 })
    } catch (error: any) {
        console.log(error)
        const msg = error?.code === 11000 ? "Bed code already exists" : "Failed to create bed"
        return NextResponse.json({ message: msg }, { status: 500 })
    }
}
