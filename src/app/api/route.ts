import { NextResponse } from "next/server";

export default function GET() {
  return NextResponse.json({ message: "message from simple api route!" });
}
