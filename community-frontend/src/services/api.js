const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8081/api";

/**
 * Fetch blacklist entries with optional filters
 * @param {Object} filters - Filter options
 * @param {string} filters.region - Region filter
 * @param {string} filters.dangerLevel - Danger level filter (위험/경고/주의)
 * @param {string} filters.search - Search query
 * @param {string} filters.sortBy - Sort option (latest/views/danger)
 * @param {number} filters.page - Page number (default: 1)
 * @param {number} filters.limit - Items per page (default: 20)
 * @returns {Promise<Object>} Response with items, total, page, totalPages
 */
export async function fetchBlacklists(filters = {}) {
  const params = new URLSearchParams();

  if (filters.region) params.append("region", filters.region);
  if (filters.dangerLevel) params.append("dangerLevel", filters.dangerLevel);
  if (filters.search) params.append("search", filters.search);
  if (filters.sortBy) params.append("sortBy", filters.sortBy);
  if (filters.page) params.append("page", filters.page.toString());
  if (filters.limit) params.append("limit", filters.limit.toString());

  const url = `${API_BASE_URL}/blacklist${
    params.toString() ? "?" + params.toString() : ""
  }`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch blacklists:", error);
    throw error;
  }
}

/**
 * Fetch blacklist statistics
 * @returns {Promise<Object>} Stats object with total, danger, warning, caution counts
 */
export async function fetchStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/blacklist/stats`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    throw error;
  }
}

/**
 * Fetch single blacklist entry by ID
 * @param {string} id - Blacklist entry ID
 * @returns {Promise<Object>} Blacklist entry object
 */
export async function fetchBlacklistById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/blacklist/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("해당 블랙리스트를 찾을 수 없습니다.");
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch blacklist:", error);
    throw error;
  }
}

/**
 * Create new blacklist entry
 * @param {Object} data - Blacklist data
 * @param {string} data.name - Name (will be masked)
 * @param {number} data.age - Age (must be >= 19)
 * @param {string} data.gender - Gender (남성/여성/기타)
 * @param {string} data.phone - Phone number (will be masked)
 * @param {string} data.region - Region
 * @param {string} data.pcCafe - PC cafe name
 * @param {string} data.dangerLevel - Danger level (위험/경고/주의)
 * @param {string} data.reason - Reason category
 * @param {string} data.description - Detailed description (min 20 chars)
 * @param {string[]} data.images - Array of image URLs
 * @returns {Promise<Object>} Created blacklist entry
 */
export async function createBlacklist(data) {
  try {
    const response = await fetch(`${API_BASE_URL}/blacklist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to create blacklist:", error);
    throw error;
  }
}
