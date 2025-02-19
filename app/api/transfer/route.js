import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request) {
  try {
    const user = JSON.parse(request.headers.get("user") || "{}")
    const { recipientEmail, amount } = await request.json()
    const client = await clientPromise
    const db = client.db("nextbank")

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const sender = await db.collection("users").findOne({ _id: new ObjectId(user.userId) })
    const recipient = await db.collection("users").findOne({ email: recipientEmail })

    if (!sender || !recipient) {
      return NextResponse.json({ error: "Sender or recipient not found" }, { status: 404 })
    }

    if (sender.balance < amount) {
      return NextResponse.json({ error: "Insufficient funds" }, { status: 400 })
    }

    // Perform the transfer
    await db.collection("users").updateOne({ _id: new ObjectId(user.userId) }, { $inc: { balance: -amount } })
    await db.collection("users").updateOne({ _id: recipient._id }, { $inc: { balance: amount } })

    // Record the transaction
    await db.collection("transactions").insertOne({
      senderId: new ObjectId(user.userId),
      recipientId: recipient._id,
      amount,
      date: new Date(),
    })

    return NextResponse.json({ message: "Transfer successful" }, { status: 200 })
  } catch (error) {
    console.error("Transfer error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

