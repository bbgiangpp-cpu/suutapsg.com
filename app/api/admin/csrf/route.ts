import { NextResponse } from "next/server";
import { generateCsrfToken, setCsrfCookie } from "@/lib/csrf";

export async function GET() {
    const token = generateCsrfToken();
    setCsrfCookie(token);

    return NextResponse.json({ token });
}
