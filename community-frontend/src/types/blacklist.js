/**
 * Filter thumbnails from image array
 * @param {Array<{url: string, type: string}>} images
 * @returns {string[]}
 */
export function getThumbnails(images) {
  return images
    .filter((img) => img.type === "thumbnail")
    .map((img) => img.url);
}

/**
 * Filter originals from image array
 * @param {Array<{url: string, type: string}>} images
 * @returns {string[]}
 */
export function getOriginals(images) {
  return images
    .filter((img) => img.type === "original")
    .map((img) => img.url);
}

/**
 * Get first thumbnail or fallback to first original
 * @param {Array<{url: string, type: string}>} images
 * @returns {string | null}
 */
export function getFirstImage(images) {
  const thumbnails = getThumbnails(images);
  if (thumbnails.length > 0) return thumbnails[0];
  
  const originals = getOriginals(images);
  if (originals.length > 0) return originals[0];
  
  return null;
}

