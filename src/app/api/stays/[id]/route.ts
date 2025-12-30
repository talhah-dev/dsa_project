import { DB } from "@/lib/db"
import Stay from "@/models/Stay"
import { NextRequest, NextResponse } from "next/server"

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_: NextRequest, context: Ctx) {
    try {
        await DB()
        const { id } = await context.params

        const stay = await Stay.findById(id)
            .populate("bedId", "code ward status")
            .populate("patientId", "name mrn phone")

        if (!stay) return NextResponse.json({ message: "Stay not found" }, { status: 404 })
        return NextResponse.json({ stay })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ message: "Failed to fetch stay" }, { status: 500 })
    }
}

export async function PATCH(req: NextRequest, context: Ctx) {
    try {
        await DB()
        const { id } = await context.params
        const body = await req.json()

        const stay = await Stay.findByIdAndUpdate(id, body, { new: true })
        if (!stay) return NextResponse.json({ message: "Stay not found" }, { status: 404 })

        return NextResponse.json({ stay })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ message: "Failed to update stay" }, { status: 500 })
    }
}
