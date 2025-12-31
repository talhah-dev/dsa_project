import { DB } from "@/lib/db"
import Stay from "@/models/Stay"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
    try {
        await DB()

        const { searchParams } = new URL(req.url)
        const bedId = searchParams.get("bedId")
        const patientId = searchParams.get("patientId")
        const status = searchParams.get("status")

        const filter: any = {}
        if (bedId) filter.bedId = bedId
        if (patientId) filter.patientId = patientId
        if (status) filter.status = status

        const stays = await Stay.find(filter)
            .populate("bedId", "code ward status")
            .populate("patientId", "name mrn phone")
            .sort({ createdAt: -1 })

        return NextResponse.json({ stays })
    } catch (error: any) {
        console.log("STAYS_GET_ERROR:", error)
        return NextResponse.json(
            { message: "Failed to fetch stays", error: error?.message || String(error) },
            { status: 500 }
        )
    }
}

export async function POST(req: NextRequest) {
    try {
        await DB()
        const body = await req.json()
        const { bedId, patientId, start, end, status } = body

        if (!bedId || !patientId || !start || !end) {
            return NextResponse.json({ message: "bedId, patientId, start, end are required" }, { status: 400 })
        }

        const s = new Date(start)
        const e = new Date(end)
        if (!(s instanceof Date) || !(e instanceof Date) || isNaN(s.getTime()) || isNaN(e.getTime())) {
            return NextResponse.json({ message: "Invalid start/end date" }, { status: 400 })
        }
        if (s >= e) return NextResponse.json({ message: "start must be before end" }, { status: 400 })

        // Simple overlap prevention (fast query). Interval tree will be used in /allocate.
        const conflict = await Stay.findOne({
            bedId,
            status: { $nin: ["cancelled", "discharged"] },
            start: { $lt: e },
            end: { $gt: s },
        })

        if (conflict) {
            return NextResponse.json({ message: "Bed is not available in this interval" }, { status: 409 })
        }

        const stay = await Stay.create({ bedId, patientId, start: s, end: e, status })
        return NextResponse.json({ stay }, { status: 201 })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ message: "Failed to create stay" }, { status: 500 })
    }
}
