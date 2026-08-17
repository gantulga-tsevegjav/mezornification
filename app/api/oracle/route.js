import { NextResponse } from "next/server";

export async function POST(request) {
  const { arg } = await request.json().catch(() => ({}));
  if (typeof arg === "string" && arg.trim().toLowerCase() === "way") {
    return NextResponse.json({ message: 'Found the way. the key is "sushi"' });
  }
  return NextResponse.json({
    reveal: true,
    message: "The Oracle sees you. But this is not the right path..."
  });
}
