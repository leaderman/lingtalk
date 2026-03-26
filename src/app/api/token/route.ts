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
    const tokenResponse = await getJWTToken({
      baseURL: process.env.LINGTALK_BASE_URL || "",
      appId: process.env.LINGTALK_APP_ID || "",
      aud: process.env.LINGTALK_AUD || "",
      keyid: process.env.LINGTALK_KEYID || "",
      privateKey: Buffer.from(process.env.LINGTALK_PRIVATE_KEY || "", "base64").toString("utf-8"),
      sessionName: uid,
      durationSeconds: 86399,
    });

    return NextResponse.json({
      code: 200,
      msg: "success",
      data: tokenResponse.access_token,
    });
  } catch (error) {
    return NextResponse.json({
      code: 500,
      msg: error instanceof Error ? error.message : "Failed to get token",
      data: "",
    });
  }
}
