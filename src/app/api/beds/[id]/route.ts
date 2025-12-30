import { DB } from "@/lib/db"
import Bed from "@/models/Bed"
import { NextRequest, NextResponse } from "next/server"

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_: NextRequest, context: Ctx) {
    try {
        await DB()
        const { id } = await context.params

        const bed = await Bed.findById(id)
        if (!bed) return NextResponse.json({ message: "Bed not found" }, { status: 404 })
        return NextResponse.json({ bed })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ message: "Failed to fetch bed" }, { status: 500 })
    }
}

export async function PATCH(req: NextRequest, context: Ctx) {
    try {
        await DB()
        const { id } = await context.params
        const body = await req.json()

        const bed = await Bed.findByIdAndUpdate(id, body, { new: true })
        if (!bed) return NextResponse.json({ message: "Bed not found" }, { status: 404 })

        return NextResponse.json({ bed })
    } catch (error: any) {
        console.log(error)
        const msg = error?.code === 11000 ? "Bed code already exists" : "Failed to update bed"
        return NextResponse.json({ message: msg }, { status: 500 })
    }
}

export async function DELETE(_: NextRequest, context: Ctx) {
    try {
        await DB()
        const { id } = await context.params

        const bed = await Bed.findByIdAndDelete(id)
        if (!bed) return NextResponse.json({ message: "Bed not found" }, { status: 404 })
        return NextResponse.json({ message: "Bed deleted" })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ message: "Failed to delete bed" }, { status: 500 })
    }
}
