import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request) {
  try {
    const user = JSON.parse(request.headers.get("user") || "{}")
    const client = await clientPromise
    const db = client.db("nextbank")

    const userAccount = await db.collection("users").findOne({ _id: new ObjectId(user.userId) })

    if (!userAccount) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ balance: userAccount.balance }, { status: 200 })
  } catch (error) {
    console.error("Balance check error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

