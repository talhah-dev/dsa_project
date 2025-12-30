import { DB } from "@/lib/db"
import Bed from "@/models/Bed"
import Patient from "@/models/Patient"
import Stay from "@/models/Stay"
import { buildIntervalTree, hasOverlap } from "@/lib/intervalTree"
import { NextRequest, NextResponse } from "next/server"

function randInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: T[]) {
    return arr[Math.floor(Math.random() * arr.length)]
}

async function ensureBeds(minBeds = 20) {
    const count = await Bed.countDocuments({ status: "active" })
    if (count >= minBeds) return

    const wards = ["ICU", "General", "Surgery", "Pediatrics"]
    const toCreate = minBeds - count

    const docs = Array.from({ length: toCreate }).map((_, i) => ({
        code: `BED-${String(Date.now()).slice(-6)}-${i + 1}`,
        ward: pick(wards),
        status: "active" as const,
    }))

    await Bed.insertMany(docs)
}

async function allocateWithIntervalTree(params: {
    patientId: string
    ward?: string
    start: Date
    end: Date
}) {
    const { patientId, ward, start, end } = params
    const bedFilter: any = { status: "active" }
    if (ward) bedFilter.ward = ward

    const beds = await Bed.find(bedFilter).sort({ createdAt: 1 })
    if (!beds.length) return null

    const target = { start: start.getTime(), end: end.getTime() }

    for (const bed of beds) {
        const stays = await Stay.find({
            bedId: bed._id,
            status: { $nin: ["cancelled", "discharged"] },
        }).select("start end")

        const intervals = stays.map((st) => ({
            start: new Date(st.start).getTime(),
            end: new Date(st.end).getTime(),
        }))

        const tree = buildIntervalTree(intervals)
        if (!hasOverlap(tree, target)) {
            const stay = await Stay.create({
                bedId: bed._id,
                patientId,
                start,
                end,
                status: "reserved",
            })
            return { bed, stay }
        }
    }

    return null
}

export async function POST(req: NextRequest) {
    try {
        await DB()

        const body = await req.json()
        const scenario = String(body?.scenario ?? "peak") as "peak" | "long" | "random"
        const requests = Number(body?.requests ?? 50)
        const bedsMin = Number(body?.bedsMin ?? 20)

        await ensureBeds(bedsMin)

        const wards = ["ICU", "General", "Surgery", "Pediatrics"]
        const now = new Date()

        let success = 0
        let failed = 0
        const createdStayIds: string[] = []

        for (let i = 0; i < requests; i++) {
            const patient = await Patient.create({
                name: `Test Patient ${Date.now()}-${i + 1}`,
                mrn: `MRN-${Date.now()}-${i + 1}`,
            })

            const ward = pick(wards)

            let start: Date
            let end: Date

            if (scenario === "peak") {
                // many requests in short period (minutes-hours)
                const startOffsetMin = randInt(0, 6 * 60)
                const durationMin = randInt(30, 6 * 60)
                start = new Date(now.getTime() + startOffsetMin * 60_000)
                end = new Date(start.getTime() + durationMin * 60_000)
            } else if (scenario === "long") {
                // long stays (days)
                const startOffsetHours = randInt(0, 24)
                const durationDays = randInt(3, 21)
                start = new Date(now.getTime() + startOffsetHours * 60 * 60_000)
                end = new Date(start.getTime() + durationDays * 24 * 60 * 60_000)
            } else {
                // random arrivals (anytime in next 14 days, duration 1h to 3d)
                const startOffsetHours = randInt(0, 14 * 24)
                const durationHours = randInt(1, 72)
                start = new Date(now.getTime() + startOffsetHours * 60 * 60_000)
                end = new Date(start.getTime() + durationHours * 60 * 60_000)
            }

            const allocated = await allocateWithIntervalTree({
                patientId: patient._id.toString(),
                ward,
                start,
                end,
            })

            if (allocated) {
                success++
                createdStayIds.push(allocated.stay._id.toString())
            } else {
                failed++
            }
        }

        return NextResponse.json({
            scenario,
            requests,
            success,
            failed,
            createdStayIds: createdStayIds.slice(0, 20),
            note: "createdStayIds is truncated to first 20",
        })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ message: "Simulation failed" }, { status: 500 })
    }
}
