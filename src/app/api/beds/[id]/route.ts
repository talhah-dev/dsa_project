import { DB } from "@/lib/db"
import Bed from "@/models/Bed"
import { NextRequest, NextResponse } from "next/server"

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
    try {
        await DB()
        const bed = await Bed.findById(params.id)
        if (!bed) return NextResponse.json({ message: "Bed not found" }, { status: 404 })
        return NextResponse.json({ bed })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ message: "Failed to fetch bed" }, { status: 500 })
    }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await DB()
        const body = await req.json()

        const bed = await Bed.findByIdAndUpdate(params.id, body, { new: true })
        if (!bed) return NextResponse.json({ message: "Bed not found" }, { status: 404 })

        return NextResponse.json({ bed })
    } catch (error: any) {
        console.log(error)
        const msg = error?.code === 11000 ? "Bed code already exists" : "Failed to update bed"
        return NextResponse.json({ message: msg }, { status: 500 })
    }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
    try {
        await DB()
        const bed = await Bed.findByIdAndDelete(params.id)
        if (!bed) return NextResponse.json({ message: "Bed not found" }, { status: 404 })
        return NextResponse.json({ message: "Bed deleted" })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ message: "Failed to delete bed" }, { status: 500 })
    }
}
