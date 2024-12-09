import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Hello, world!" });
}

export const dynamic = "force-dynamic"; // Ensure route is handled dynamically

export async function POST(req: Request) {
  try {
    return NextResponse.json({ message: "Hello from POST!" });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
