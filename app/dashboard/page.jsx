"use client"


import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

export default function Dashboard() {
  const [balance, setBalance] = useState(0)
  const [depositAmount, setDepositAmount] = useState("")
  const [transferAmount, setTransferAmount] = useState("")
  const [recipientEmail, setRecipientEmail] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchBalance()
  }, [])

  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/balance", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (response.ok) {
        setBalance(data.balance)
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Balance fetch error:", error)
      toast({
        title: "Error",
        description: "Failed to fetch balance. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeposit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: Number.parseFloat(depositAmount) }),
      })
      const data = await response.json()
      if (response.ok) {
        toast({
          title: "Deposit successful",
          description: `$${depositAmount} has been added to your account.`,
        })
        setDepositAmount("")
        fetchBalance()
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Deposit error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleTransfer = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientEmail,
          amount: Number.parseFloat(transferAmount),
        }),
      })
      const data = await response.json()
      if (response.ok) {
        toast({
          title: "Transfer successful",
          description: `$${transferAmount} has been sent to ${recipientEmail}.`,
        })
        setTransferAmount("")
        setRecipientEmail("")
        fetchBalance()
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Transfer error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-3xl font-bold mb-8">NextBank Dashboard</h1>
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Current Balance</h2>
          <p className="text-4xl font-bold">${balance.toFixed(2)}</p>
        </div>
        <form onSubmit={handleDeposit} className="space-y-4">
          <h3 className="text-xl font-semibold">Deposit</h3>
          <div>
            <Label htmlFor="depositAmount">Amount</Label>
            <Input
              id="depositAmount"
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              required
              min="0.01"
              step="0.01"
            />
          </div>
          <Button type="submit" className="w-full">
            Deposit
          </Button>
        </form>
        <form onSubmit={handleTransfer} className="space-y-4">
          <h3 className="text-xl font-semibold">Transfer</h3>
          <div>
            <Label htmlFor="recipientEmail">Recipient Email</Label>
            <Input
              id="recipientEmail"
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="transferAmount">Amount</Label>
            <Input
              id="transferAmount"
              type="number"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              required
              min="0.01"
              step="0.01"
            />
          </div>
          <Button type="submit" className="w-full">
            Transfer
          </Button>
        </form>
      </div>
    </div>
  )
}

