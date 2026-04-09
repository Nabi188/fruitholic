import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { envConfig } from "@/lib/envConfig";
import { createSupabaseServerClient } from "@/lib/supabase/server";

cloudinary.config({
  cloud_name: envConfig.CLOUDINARY_CLOUD_NAME,
  api_key: envConfig.CLOUDINARY_API_KEY,
  api_secret: envConfig.CLOUDINARY_API_SECRET,
});

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: "fruitholic/products" },
    envConfig.CLOUDINARY_API_SECRET,
  );

  return NextResponse.json({
    timestamp,
    signature,
    cloudName: envConfig.CLOUDINARY_CLOUD_NAME,
    apiKey: envConfig.CLOUDINARY_API_KEY,
    // TODO: Đọc lại docs > Không vào đúng folder khi upload
    folder: "fruitholic/products",
  });
}
