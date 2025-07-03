
import API_BASE_URL from "../config";

export async function fetchFiresForNepal() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/fires`);
    if (!res.ok) throw new Error("Failed to fetch FIRMS fire data");
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("FIRMS fetch error", err);
    return [];
  }
}
