import { NextResponse } from "next/server";
import { ThirdwebStorage } from "@thirdweb-dev/storage";

const storage = new ThirdwebStorage({
  secretKey: process.env.THIRDWEB_SECRET_KEY || "",
});
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const uri = searchParams.get("uri");
    if (!uri) {
      return NextResponse.json({ error: "Missing URI" }, { status: 400 });
    }
    const fileData = await storage.download(uri);
    return NextResponse.json(
      { url: fileData.url },
    );
  } catch (error) {
    console.error("Error downloading from IPFS:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    );
  }
}
