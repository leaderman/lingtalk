import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");

  return NextResponse.json({
    code: 200,
    msg: "success",
    data: "",
  });
}
