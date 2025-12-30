import { DB } from "@/lib/db"
import User from "@/models/User"
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(req: NextRequest) {
    try {
        await DB()
        const body = await req.json()

        const email = String(body?.email ?? "").trim().toLowerCase()
        const password = String(body?.password ?? "")

        if (!email || !password) {
            return NextResponse.json({ message: "email and password are required" }, { status: 400 })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
        }

        const ok = await bcrypt.compare(password, user.password)
        if (!ok) {
            return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
        }

        const secret = process.env.JWT_SECRET
        if (!secret) {
            return NextResponse.json({ message: "JWT_SECRET is missing" }, { status: 500 })
        }

        const token = jwt.sign(
            { userId: user._id.toString(), email: user.email },
            secret,
            { expiresIn: "7d" }
        )

        return NextResponse.json({
            message: "Login successful",
            token,
            user: { id: user._id, name: user.name, email: user.email },
        })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ message: "Something went wrong in login" }, { status: 500 })
    }
}
