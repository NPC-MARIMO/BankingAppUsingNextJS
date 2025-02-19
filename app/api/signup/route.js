import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import clientPromise from "@/lib/mongodb"

export async function POST(request) {
  try {
    const { name, email, password } = await request.json()
    const client = await clientPromise
    const db = client.db("nextbank")

    // Check if user already exists 
    const existingUser = await db.collection("users").findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user
    const result = await db.collection("users").insertOne({
      name,
      email,
      password: hashedPassword,
      balance: 0,
      createdAt: new Date(),
    })

    return NextResponse.json({ message: "User created successfully", userId: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

