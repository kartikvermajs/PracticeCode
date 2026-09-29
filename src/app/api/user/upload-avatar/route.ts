import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const userId = user?.id || "user_kartik_dev";

    const contentType = req.headers.get("content-type") || "";

    let imageBase64OrUrl: string = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { error: "No image file provided." },
          { status: 400 }
        );
      }

      // Validate size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File size exceeds 5MB limit." },
          { status: 400 }
        );
      }

      // Convert file buffer to Base64 Data URI
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const mimeType = file.type || "image/png";
      imageBase64OrUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
    } else {
      const body = await req.json();
      imageBase64OrUrl = body.image || "";
    }

    if (!imageBase64OrUrl) {
      return NextResponse.json(
        { error: "Invalid image data." },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const uploadResult = await uploadImageToCloudinary(imageBase64OrUrl, {
      folder: "coderev/avatars",
      publicId: `avatar_${userId}_${Date.now()}`,
    });

    // Update User record in Neon PostgreSQL
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { image: uploadResult.url },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
      },
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      user: updatedUser,
      message: "Avatar uploaded to Cloudinary and profile updated successfully!",
    });
  } catch (error: any) {
    console.error("Cloudinary upload API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload image to Cloudinary." },
      { status: 500 }
    );
  }
}
