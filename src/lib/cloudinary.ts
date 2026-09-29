import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "djcggiop6",
  api_key: process.env.CLOUDINARY_API_KEY || "866624849563131",
  api_secret: process.env.CLOUDINARY_API_SECRET || "8KDloYxmH1dDlDBWzdmOFBqnxnY",
  secure: true,
});

export async function uploadImageToCloudinary(
  fileBase64OrUrl: string,
  options?: { folder?: string; publicId?: string }
): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(fileBase64OrUrl, {
    folder: options?.folder || "coderev/avatars",
    public_id: options?.publicId,
    transformation: [
      { width: 300, height: 300, crop: "fill", gravity: "face" },
      { quality: "auto", fetch_format: "auto" },
    ],
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

export { cloudinary };
