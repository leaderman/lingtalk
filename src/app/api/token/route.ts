import { NextRequest, NextResponse } from "next/server";
import { getJWTToken } from "@coze/api";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");

  if (!uid) {
    return NextResponse.json({
      code: 400,
      msg: "uid is required",
      data: "",
    });
  }

  try {
    const token = await getJWTToken({
      baseURL: process.env.COZE_BASE_URL || "",
      appId: process.env.COZE_APP_ID || "",
      aud: process.env.COZE_AUD || "",
      keyid: process.env.COZE_KEYID || "",
      privateKey: process.env.COZE_PRIVATE_KEY || "",
      sessionName: uid,
    });

    return NextResponse.json({
      code: 200,
      msg: "success",
      data: token,
    });
  } catch (error) {
    return NextResponse.json({
      code: 500,
      msg: error instanceof Error ? error.message : "Failed to get token",
      data: "",
    });
  }
}
