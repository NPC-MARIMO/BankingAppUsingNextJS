import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

export async function middleware(request: NextRequest) {
  const token = request.headers.get("authorization")?.split(" ")[1]

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 401 })
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET))
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("user", JSON.stringify(payload))

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}

export const config = {
  matcher: ["/api/balance", "/api/deposit", "/api/transfer"],
}

