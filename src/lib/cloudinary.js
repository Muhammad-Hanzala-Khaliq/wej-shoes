/**
 * Generate optimized Cloudinary image URL
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} options - Image transformation options
 * @param {number} options.width - Image width
 * @param {number} options.height - Image height
 * @param {number} options.quality - Image quality (1-100)
 * @param {string} options.format - Image format (auto, webp, jpg, png)
 * @returns {string} Optimized image URL
 */
export function getCloudinaryUrl(publicId, options = {}) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    console.error("CLOUDINARY_CLOUD_NAME is not configured");
    return "";
  }

  const { width, height, quality = "auto", format = "auto" } = options;

  const transformations = [];
  if (width || height) {
    const w = width ? `w_${width}` : "";
    const h = height ? `h_${height}` : "";
    transformations.push(`c_fill,${w},${h}`.replace(/^,/, ""));
  }
  transformations.push(`q_${quality}`, `f_${format}`);

  const transformStr = transformations.join(",");
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformStr}/${publicId}`;
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
