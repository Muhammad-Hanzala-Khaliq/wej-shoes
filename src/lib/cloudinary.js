/**
 * Generate optimized Cloudinary image URL
 * For use WITH next/image — does NOT add f_auto/dpr_auto (next/image handles those)
 * @param {string} publicId - Cloudinary public ID or full URL
 * @param {Object} options
 * @param {number} options.width - Image width
 * @param {number} options.height - Image height
 * @returns {string} Optimized image URL
 */
export function getCloudinaryUrl(publicId, options = {}) {
  if (!publicId) return "";

  // Non-cloudinary or external URL — return as-is
  if (
    !publicId.includes("cloudinary") &&
    !publicId.startsWith("http") &&
    !publicId.includes("/")
  ) {
    return publicId;
  }

  // Already has transformations — return as-is (avoid double-processing)
  if (publicId.includes("/upload/") && publicId.includes("c_fill")) {
    return publicId;
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    console.error("CLOUDINARY_CLOUD_NAME is not configured");
    return publicId;
  }

  // Extract the public ID from a full URL if needed
  let cleanId = publicId;
  if (publicId.startsWith("http")) {
    const parts = publicId.split("/upload/");
    cleanId = parts[1] || publicId;
  }

  const { width, height } = options;

  // Build transformations: c_fill, w, h, q_auto
  // NO f_auto — next/image handles format (AVIF/WebP)
  // NO dpr_auto — next/image handles DPR via sizes prop
  const transforms = ["c_fill"];
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  transforms.push("q_auto");

  const transformStr = transforms.join(",");
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformStr}/${cleanId}`;
}

/**
 * Standard image sizes for product images
 * @returns {Object} Image size presets
 */
export function getImageSizes() {
  return {
    thumbnail: { width: 200, height: 200 },
    medium: { width: 400, height: 400 },
    large: { width: 800, height: 800 },
    hero: { width: 1200, height: 600 },
  };
}
