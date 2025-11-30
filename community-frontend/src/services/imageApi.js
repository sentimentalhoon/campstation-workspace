const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8081";

/**
 * Upload image to MinIO and get thumbnail + original URLs
 * @param {File} file - Image file to upload
 * @param {string} folder - Folder name (default: 'blacklists')
 * @returns {Promise<{originalUrl: string, thumbnailUrl: string}>}
 */
export async function uploadImage(file, folder = "blacklists") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Image upload failed");
  }

  const data = await response.json();
  return {
    originalUrl: data.originalUrl,
    thumbnailUrl: data.thumbnailUrl,
  };
}

/**
 * Delete image from MinIO
 * @param {string} originalUrl - Original image URL
 * @param {string} thumbnailUrl - Thumbnail image URL
 */
export async function deleteImage(originalUrl, thumbnailUrl) {
  const params = new URLSearchParams();
  if (originalUrl) params.append("originalUrl", originalUrl);
  if (thumbnailUrl) params.append("thumbnailUrl", thumbnailUrl);

  const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Image deletion failed");
  }

  return await response.json();
}
