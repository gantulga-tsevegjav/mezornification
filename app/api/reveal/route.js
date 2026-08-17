import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ value: 'follow the "white_rabbit"' }, { headers: { "Cache-Control": "no-store" } });
}
