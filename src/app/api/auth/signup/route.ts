import { DB } from "@/lib/db"
import User from "@/models/User"
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    await DB()
    const body = await req.json()

    const name = String(body?.name ?? "").trim()
    const email = String(body?.email ?? "").trim().toLowerCase()
    const password = String(body?.password ?? "")

    if (!name || !email || !password) {
      return NextResponse.json({ message: "name, email, password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 })
    }

    const exists = await User.findOne({ email }).select("_id")
    if (exists) {
      return NextResponse.json({ message: "Email already exists" }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, password: hashed })

    return NextResponse.json(
      {
        message: "Signup successful",
        user: { id: user._id, name: user.name, email: user.email },
      },
      { status: 201 }
    )
  } catch (error) {
    console.log(error)
    return NextResponse.json({ message: "Something went wrong in signup" }, { status: 500 })
  }
}
