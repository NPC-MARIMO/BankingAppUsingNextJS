import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request) {
  try {
    const user = JSON.parse(request.headers.get("user") || "{}")
    const { amount } = await request.json()
    const client = await clientPromise
    const db = client.db("nextbank")

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const result = await db
      .collection("users")
      .updateOne({ _id: new ObjectId(user.userId) }, { $inc: { balance: amount } })

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "User not found or deposit failed" }, { status: 404 })
    }

    // Record the transaction
    await db.collection("transactions").insertOne({
      userId: new ObjectId(user.userId),
      type: "deposit",
      amount,
      date: new Date(),
    })

    return NextResponse.json({ message: "Deposit successful" }, { status: 200 })
  } catch (error) {
    console.error("Deposit error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

