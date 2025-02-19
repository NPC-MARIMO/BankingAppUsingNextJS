import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import clientPromise from "@/lib/mongodb"

if (!process.env.JWT_SECRET) {
  throw new Error('Invalid/Missing environment variable: "JWT_SECRET"')
}

export async function POST(request) {
  try {
    const { email, password } = await request.json()
    const client = await clientPromise
    const db = client.db("nextbank")

    // Find user
    const user = await db.collection("users").findOne({ email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" })

    return NextResponse.json({ token, userId: user._id }, { status: 200 })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

