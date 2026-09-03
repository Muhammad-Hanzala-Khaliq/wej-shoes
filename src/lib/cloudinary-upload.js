import crypto from "crypto";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;
const UPLOAD_PRESET = "wej-shoes-products"; // Unsigned upload preset

/**
 * Generate Cloudinary signature for signed uploads
 * @param {Object} params - Parameters to sign (sorted alphabetically)
 * @returns {string} SHA-1 signature
 */
function generateSignature(params) {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto
    .createHash("sha1")
    .update(sortedParams + API_SECRET)
    .digest("hex");
}

/**
 * Upload image buffer to Cloudinary (Unsigned Upload - Recommended)
 * @param {Buffer} buffer - Image buffer
 * @param {string} [folder="products"] - Cloudinary folder
 * @returns {Promise<Object>} { publicId, url, width, height, format }
 */
export async function uploadToCloudinary(buffer, folder = "products") {
  if (!CLOUD_NAME) {
    throw new Error("Cloudinary cloud name is not configured");
  }

  const formData = new FormData();

  // Convert buffer to Blob for FormData
  const blob = new Blob([buffer], { type: "image/jpeg" });
  formData.append("file", blob, `upload_${Date.now()}.jpg`);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", folder);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  const response = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error?.message || "Failed to upload image to Cloudinary",
    );
  }

  return {
    publicId: data.public_id,
    url: data.secure_url,
    width: data.width,
    height: data.height,
    format: data.format,
  };
}

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteFromCloudinary(publicId) {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    throw new Error("Cloudinary credentials are not configured");
  }

  const timestamp = Math.round(Date.now() / 1000);
  const signature = generateSignature({ public_id: publicId, timestamp });

  const formData = new FormData();
  formData.append("public_id", publicId);
  formData.append("api_key", API_KEY);
  formData.append("timestamp", timestamp.toString());
  formData.append("signature", signature);

  const deleteUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`;

  const response = await fetch(deleteUrl, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Failed to delete image from Cloudinary");
  }

  return data;
}