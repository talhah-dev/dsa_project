// import { DB } from "@/lib/db"
// import Bed from "@/models/Bed"
// import Patient from "@/models/Patient"
// import Stay from "@/models/Stay"
// import { NextRequest, NextResponse } from "next/server"

// export async function POST(req: NextRequest) {
//     try {
//         await DB()

//         const body = await req.json()
//         const { patientId, patientName, mrn, phone, ward, start, end } = body

//         if (!start || !end) {
//             return NextResponse.json({ message: "start and end are required" }, { status: 400 })
//         }

//         const s = new Date(start)
//         const e = new Date(end)
//         if (isNaN(s.getTime()) || isNaN(e.getTime())) {
//             return NextResponse.json({ message: "Invalid start/end date" }, { status: 400 })
//         }
//         if (s >= e) return NextResponse.json({ message: "start must be before end" }, { status: 400 })

//         // Create/find patient
//         let patient = null
//         if (patientId) {
//             patient = await Patient.findById(patientId)
//         } else {
//             if (!patientName) {
//                 return NextResponse.json({ message: "patientId or patientName is required" }, { status: 400 })
//             }
//             patient = await Patient.create({ name: patientName, mrn, phone })
//         }

//         if (!patient) return NextResponse.json({ message: "Patient not found" }, { status: 404 })

//         // Candidate beds
//         const bedFilter: any = { status: "active" }
//         if (ward) bedFilter.ward = ward

//         const beds = await Bed.find(bedFilter).sort({ createdAt: 1 })
//         if (beds.length === 0) {
//             return NextResponse.json({ message: "No beds available in this ward" }, { status: 404 })
//         }

//         // Find first free bed
//         for (const bed of beds) {
//             const conflict = await Stay.findOne({
//                 bedId: bed._id,
//                 status: { $nin: ["cancelled", "discharged"] },
//                 start: { $lt: e },
//                 end: { $gt: s },
//             })

//             if (!conflict) {
//                 const stay = await Stay.create({
//                     bedId: bed._id,
//                     patientId: patient._id,
//                     start: s,
//                     end: e,
//                     status: "reserved",
//                 })

//                 return NextResponse.json(
//                     {
//                         bed: { id: bed._id, code: bed.code, ward: bed.ward },
//                         patient: { id: patient._id, name: patient.name },
//                         stay,
//                     },
//                     { status: 201 }
//                 )
//             }
//         }

//         return NextResponse.json({ message: "All beds are occupied in this interval" }, { status: 409 })
//     } catch (error) {
//         console.log(error)
//         return NextResponse.json({ message: "Failed to allocate bed" }, { status: 500 })
//     }
// }





import { DB } from "@/lib/db"
import Bed from "@/models/Bed"
import Patient from "@/models/Patient"
import Stay from "@/models/Stay"
import { buildIntervalTree, hasOverlap } from "@/lib/intervalTree"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    await DB()

    const body = await req.json()
    const { patientId, patientName, mrn, phone, ward, start, end } = body

    if (!start || !end) {
      return NextResponse.json({ message: "start and end are required" }, { status: 400 })
    }

    const s = new Date(start)
    const e = new Date(end)
    if (isNaN(s.getTime()) || isNaN(e.getTime())) {
      return NextResponse.json({ message: "Invalid start/end date" }, { status: 400 })
    }
    if (s >= e) return NextResponse.json({ message: "start must be before end" }, { status: 400 })

    let patient = null
    if (patientId) {
      patient = await Patient.findById(patientId)
    } else {
      if (!patientName) {
        return NextResponse.json({ message: "patientId or patientName is required" }, { status: 400 })
      }
      patient = await Patient.create({ name: patientName, mrn, phone })
    }

    if (!patient) return NextResponse.json({ message: "Patient not found" }, { status: 404 })

    const bedFilter: any = { status: "active" }
    if (ward) bedFilter.ward = ward

    const beds = await Bed.find(bedFilter).sort({ createdAt: 1 })
    if (beds.length === 0) {
      return NextResponse.json({ message: "No beds available in this ward" }, { status: 404 })
    }

    const target = { start: s.getTime(), end: e.getTime() }

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
      const conflict = hasOverlap(tree, target)

      if (!conflict) {
        const stay = await Stay.create({
          bedId: bed._id,
          patientId: patient._id,
          start: s,
          end: e,
          status: "reserved",
        })

        return NextResponse.json(
          {
            bed: { id: bed._id, code: bed.code, ward: bed.ward },
            patient: { id: patient._id, name: patient.name },
            stay,
          },
          { status: 201 }
        )
      }
    }

    return NextResponse.json({ message: "All beds are occupied in this interval" }, { status: 409 })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ message: "Failed to allocate bed" }, { status: 500 })
  }
}
